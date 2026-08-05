import pandas as pd
import numpy as np
from Database.DatabaseConnection import engine
from sqlalchemy import text

TRAINING_START_DATE = pd.Timestamp("2022-12-25")

def get_qty_consumption(startDate: str, endDate: str, location_id: int) -> pd.DataFrame: #Query past 180 days of data for forecasting features

    query = text("""
        SELECT 
        q.date,
        q.location,
        q.locationtype,
        q.item,
        q.itemcategory,
        SUM(q."qty") as ConsumptionQty from
        (
            select
            s."Sales_Date" as Date,
            l."ID" as location,
            l."Location_Type" as locationType,
            si."Item_ID" as item,
            it."Item_Category" as itemCategory,
            sum(si."Sold_Quantity") as Qty
            from "Sales" s
            inner join "Location" l
            on s."Location_ID" = l."ID"
            and l."Is_Deleted" = '0'
            and l."ID" = :location_id
            inner join "Sales_Item" si
            on s."ID" = si."Sales_ID"
            and si."Is_Deleted" = '0'
            --and si."Is_Promotion" = '0'
            inner join "Item" it
            on si."Item_ID" = it."ID"
            and it."Is_Deleted" = '0'
            where s."Is_Deleted" = '0'
            and s."Sales_Date" between :startDate and :endDate
            group by s."Sales_Date", si."Item_ID", it."Item_Category", l."ID", l."Location_Type"

            UNION ALL

            select
            h."Order_Date" as Date,
            l."ID" as location,
            l."Location_Type" as locationType,
            i."Item_ID" as item,
            it."Item_Category" as itemCategory,
            sum(i."Request_Quantity") as Qty
            from "OrderFulfillmentHeader" h
            inner join "OrderFulfillmentItem" i
            on h."ID" = i."Fulfillment_ID"
            and i."Is_Deleted" = '0'
            and i."Status" not in (0,4)
            inner join "Item" it
            on i."Item_ID" = it."ID"
            and it."Is_Deleted" = '0'
            inner join "Location" l
            on h."Location_ID" = l."ID"
            and l."Is_Deleted" = '0'
            and l."ID" = :location_id
            where h."Is_Deleted" = '0'
            and h."Order_Date" between :startDate and :endDate
            group by h."Order_Date", i."Item_ID", it."Item_Category", l."ID", l."Location_Type"

            UNION ALL

            select
            st."Transfer_Date" as Date,
            l."ID" as location,
            l."Location_Type" as locationType,
            st."Item_ID" as item,
            it."Item_Category" as itemCategory,
            sum(st."Transfer_Quantity") as Qty
            from "Stock_Transfer" st
            inner join "Location" l
            on st."From_Location_ID" = l."ID"
            and l."Is_Deleted" = '0'
            and l."ID" = :location_id
            inner join "Item" it
            on st."Item_ID" = it."ID"
            and it."Is_Deleted" = '0'
            where st."Is_Deleted" = '0'
            and st."Transfer_Date" between :startDate and :endDate
            group by st."Transfer_Date", st."Item_ID", it."Item_Category", l."ID", l."Location_Type"
        ) q
        group by q.date, q.location, q.item, q.itemcategory, q.locationtype
        order by q.date, q.location, q.item
    """)

    return pd.read_sql(
        query,
        engine,
        params={"startDate": startDate, "endDate": endDate, "location_id": location_id}
    )

def BuildFeature(self, location_id: int) -> pd.DataFrame:

    df = get_qty_consumption('2024-12-01', '2026-01-28', location_id)
    df["date"] = pd.to_datetime(df["date"])

    df = df.sort_values(
        ["item", "location", "date"]
    ).reset_index(drop=True)

    #Retrieve the day of month
    df["DayOfMonth"] = df["date"].dt.day

    #Calculate the current month since start
    start_date = df["date"].min()

    # df["MonthsSinceStart"] = (
    #     (df["date"].dt.year - start_date.year) * 12
    #     + (df["date"].dt.month - start_date.month)
    # )

    df["MonthsSinceStart"] = (
        (df["date"].dt.year - TRAINING_START_DATE.year) * 12
        + (df["date"].dt.month - TRAINING_START_DATE.month)
    )

    # group = df.groupby(["item", "location"], group_keys=False)
    # print(df.groupby(["item", "location"]).size())
    # print(df.groupby(["item", "location"]).size().describe())

    df["QtyConsumptionToday"] = df["consumptionqty"]

    # df["QtyConsumptionPast7Days"] = (
    # group["consumptionqty"]
    # .transform(lambda s:
    #     s.shift(1)
    #      .rolling(7, min_periods=1)
    #      .sum())
    # )

    # df["QtyConsumptionPast14Days"] = (
    # group["consumptionqty"]
    # .transform(lambda s:
    #     s.shift(1)
    #      .rolling(14, min_periods=1)
    #      .sum())
    # )

    # df["QtyConsumptionPast30Days"] = (
    #     group["consumptionqty"]
    #     .transform(lambda s:
    #         s.shift(1)
    #         .rolling(30, min_periods=1)
    #         .sum())
    # )

    # df["QtyConsumptionPast30Days_M1"] = (
    #     group["consumptionqty"]
    #     .transform(lambda s:
    #         s.shift(31)
    #         .rolling(30, min_periods=1)
    #         .sum())
    # )

    # df["QtyConsumptionPast30Days_M2"] = (
    #     group["consumptionqty"]
    #     .transform(lambda s:
    #         s.shift(61)
    #         .rolling(30, min_periods=1)
    #         .sum())
    # )

    # df["QtyConsumptionPast30Days_M3"] = (
    #     group["consumptionqty"]
    #     .transform(lambda s:
    #         s.shift(91)
    #         .rolling(30, min_periods=1)
    #         .sum())
    # )

    history = df.copy()

    df = (
        df.sort_values("date")
        .groupby(["item", "location"])
        .tail(1)
        .reset_index(drop=True)
    )

    forecast_date = history["date"].max()

    # Current windows
    past7 = get_window_sum(
        history,
        forecast_date - pd.Timedelta(days=1),
        7
    ).rename(columns={"consumptionqty": "QtyConsumptionPast7Days"})

    past14 = get_window_sum(
        history,
        forecast_date - pd.Timedelta(days=1),
        14
    ).rename(columns={"consumptionqty": "QtyConsumptionPast14Days"})

    past30 = get_window_sum(
        history,
        forecast_date - pd.Timedelta(days=1),
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days"})

    m1_end = forecast_date - pd.Timedelta(days=31)

    past30_m1 = get_window_sum(
        history,
        m1_end,
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days_M1"})

    m2_end = forecast_date - pd.Timedelta(days=61)

    past30_m2 = get_window_sum(
        history,
        m2_end,
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days_M2"})

    m3_end = forecast_date - pd.Timedelta(days=91)

    past30_m3 = get_window_sum(
        history,
        m3_end,
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days_M3"})

    m4_end = forecast_date - pd.Timedelta(days=121)

    past30_m4 = get_window_sum(
        history,
        m4_end,
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days_M4"})

    m5_end = forecast_date - pd.Timedelta(days=151)

    past30_m5 = get_window_sum(
        history,
        m5_end,
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days_M5"})

    y1_end = forecast_date - pd.Timedelta(days=361)

    past30_y1 = get_window_sum(
        history,
        y1_end,
        30
    ).rename(columns={"consumptionqty": "QtyConsumptionPast30Days_Y1"})

    for feature_df in [
    past7,
    past14,
    past30,
    past30_m1,
    past30_m2,
    past30_m3,
    past30_m4,
    past30_m5,
    past30_y1
    ]:
        df = df.merge(
            feature_df,
            on=["item", "location"],
            how="left"
        )

    df["AvgQtyConsumptionPast7Days"] = (
        df["QtyConsumptionPast7Days"] / 7
    )

    df["AvgQtyConsumptionPast14Days"] = (
        df["QtyConsumptionPast14Days"] / 14
    )

    df["AvgQtyConsumptionPast30Days"] = (
        df["QtyConsumptionPast30Days"] / 30
    )

    df["DemandTrend14vs30"] = np.where(
        df["AvgQtyConsumptionPast30Days"] == 0,
        0,
        df["AvgQtyConsumptionPast14Days"] / df["AvgQtyConsumptionPast30Days"]
    )

    past30_std = get_window_std(
        history,
        forecast_date - pd.Timedelta(days=1),
        30
    )

    df = df.merge(
        past30_std,
        on=["item","location"],
        how="left"
    )

    forecast_date = df["date"].max()
    last_year_date = forecast_date - pd.DateOffset(years=1)
    queryLastYearDate = last_year_date.strftime("%Y-%m-%d")

    lastYearDf = get_qty_consumption(queryLastYearDate, queryLastYearDate, location_id)

    lastYearDf = lastYearDf.rename(columns={
    "consumptionqty": "Qty_SameDayLastYear"
    })

    df = df.merge(
    lastYearDf[
        ["item",
         "location",
         "Qty_SameDayLastYear"]
    ],
    on=["item", "location"],
    how="left"
    )

    df["Qty_SameDayLastYear"] = (
        df["Qty_SameDayLastYear"]
        .fillna(0)
    )

    # df['Qty_Lag1'] = df.groupby(['location', 'item'])['ConsumptionQty'].shift(1)
    # df['Qty_Lag7'] = df.groupby(['location', 'item'])['ConsumptionQty'].shift(7)
    # df['Qty_Lag30'] = df.groupby(['location', 'item'])['ConsumptionQty'].shift(30)
    
    # # Fill NaN values with 0 for lag features
    # df[['Qty_Lag1', 'Qty_Lag7', 'Qty_Lag30']] = df[['Qty_Lag1', 'Qty_Lag7', 'Qty_Lag30']].fillna(0)

    rolling_columns = [
    "QtyConsumptionPast7Days",
    "QtyConsumptionPast14Days",
    "QtyConsumptionPast30Days",
    "StdDevPast30Days"
    ]

    df[rolling_columns] = (
        df[rolling_columns]
        .fillna(0)
    )

    df = df.rename(columns={
        "itemcategory": "ItemCategory"
    })

    df = df.rename(columns={
        "locationtype": "LocationType"
    })

    df = df.rename(columns={
        "item": "ItemID"
    })

    df = df.rename(columns={
        "location": "LocationID"
    })

    df = df.rename(columns={
        "date": "Date"
    })

    df = (
        df.replace([np.inf, -np.inf], np.nan)
        .fillna(0)
    )

    features = df[
    [
        "Date",
        "ItemCategory",
        "LocationType",
        "ItemID",
        "LocationID",
        "DayOfMonth",
        "MonthsSinceStart",

        "QtyConsumptionToday",
        "QtyConsumptionPast7Days",
        "QtyConsumptionPast14Days",
        "QtyConsumptionPast30Days",

        "QtyConsumptionPast30Days_M1",
        "QtyConsumptionPast30Days_M2",
        "QtyConsumptionPast30Days_M3",
        "QtyConsumptionPast30Days_M4",
        "QtyConsumptionPast30Days_M5",
        "QtyConsumptionPast30Days_Y1",

        "AvgQtyConsumptionPast7Days",
        "AvgQtyConsumptionPast14Days",
        "AvgQtyConsumptionPast30Days",

        "DemandTrend14vs30",
        "StdDevPast30Days",
        "Qty_SameDayLastYear"
    ]]

    return features

def get_window_sum(history_df, end_date, days):
    """
    Returns the total consumption within a date window.

    end_date : inclusive end date
    days     : number of days in window
    """

    start_date = end_date - pd.Timedelta(days=days - 1)

    result = (
        history_df[
            (history_df["date"] >= start_date) &
            (history_df["date"] <= end_date)
        ]
        .groupby(["item", "location"])["consumptionqty"]
        .sum()
        .reset_index()
    )

    return result

def get_window_std(history_df, end_date, days):

    start_date = end_date - pd.Timedelta(days=days - 1)

    return (
        history_df[
            (history_df["date"] >= start_date) &
            (history_df["date"] <= end_date)
        ]
        .groupby(["item","location"])["consumptionqty"]
        .std()
        .fillna(0)
        .reset_index(name="StdDevPast30Days")
    )