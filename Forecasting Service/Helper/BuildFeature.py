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

    df = get_qty_consumption('2025-08-01', '2026-01-28', location_id)
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

    group = df.groupby(["item", "location"], group_keys=False)

    df["QtyConsumptionToday"] = df["consumptionqty"]

    df["QtyConsumptionPast7Days"] = (
    group["consumptionqty"]
    .transform(lambda s:
        s.shift(1)
         .rolling(7, min_periods=1)
         .sum())
    )

    df["QtyConsumptionPast14Days"] = (
    group["consumptionqty"]
    .transform(lambda s:
        s.shift(1)
         .rolling(14, min_periods=1)
         .sum())
    )

    df["QtyConsumptionPast30Days"] = (
        group["consumptionqty"]
        .transform(lambda s:
            s.shift(1)
            .rolling(30, min_periods=1)
            .sum())
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

    df["DemandTrend14vs30"] = np.where(
        df["AvgQtyConsumptionPast30Days"] == 0,
        0,
        df["AvgQtyConsumptionPast14Days"] / df["AvgQtyConsumptionPast30Days"]
    )

    df["StdDevPast30Days"] = (
        group["consumptionqty"]
        .transform(lambda s:
            s.shift(1)
            .rolling(30, min_periods=1)
            .std()
        )
        .fillna(0)
    )

    df = df.sort_values("date").groupby(["item", "location"]).tail(1).reset_index(drop=True)

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

        "AvgQtyConsumptionPast7Days",
        "AvgQtyConsumptionPast14Days",
        "AvgQtyConsumptionPast30Days",

        "DemandTrend14vs30",
        "StdDevPast30Days",
        "Qty_SameDayLastYear"
    ]]

    return features