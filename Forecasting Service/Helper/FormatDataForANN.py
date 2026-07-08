import pandas as pd
import numpy as np

def FormatDataFrame(dataFramesource) -> pd.DataFrame:
    df = dataFramesource.copy()
    
    # location_avg = df.groupby("LocationID")["QtyConsumptionToday"].mean().rename("LocationAvgDailyDemand")
    # df = df.merge(location_avg, on="LocationID", how="left")

    df["Date"] = pd.to_datetime(
        {
            "year": df["Year"],
            "month": df["Month"],
            "day": df["DayOfMonth"]
        }
    )
    # df['DayOfWeek'] = df['Date'].dt.dayofweek
    # # DayOfWeek: cycle length = 7
    # df['DayOfWeek_sin'] = np.sin(2 * np.pi * df['DayOfWeek'] / 7)
    # df['DayOfWeek_cos'] = np.cos(2 * np.pi * df['DayOfWeek'] / 7)

    # # Month: cycle length = 12
    # df['Month_sin'] = np.sin(2 * np.pi * df['Month'] / 12)
    # df['Month_cos'] = np.cos(2 * np.pi * df['Month'] / 12)

    # # DayOfMonth: cycle length = 31
    # df['DayOfMonth_sin'] = np.sin(2 * np.pi * df['DayOfMonth'] / 31)
    # df['DayOfMonth_cos'] = np.cos(2 * np.pi * df['DayOfMonth'] / 31)

    df = df.drop(columns=['Year'])
    df = df.drop(columns=['Month'])
    #df = df.drop(columns=['DayOfMonth'])
    # df = df.drop(columns=['DayOfWeek'])

    df["MonthsSinceStart"] = (
        (df["Date"].dt.year - df["Date"].dt.year.min()) * 12
        + (df["Date"].dt.month - 1)
    )

    df["IsPaydayWindow"] = np.where(
        (df["Date"].dt.day >= 25) |
        (df["Date"].dt.day <= 5),
        1,
        0
    )

    # df["IsHoliday_PaydayWindow"] = np.where(
    #     (df["IsHoliday"] == 1) &
    #     (df["IsPaydayWindow"] == 1),
    #     1,
    #     0
    # )

    last_year_lookup = (
        df[
            [
                "ItemID",
                "LocationID",
                "Date",
                "QtyConsumptionToday"
            ]
        ]
        .rename(
            columns={
                "QtyConsumptionToday": "Qty_SameDayLastYear"
            }
        )
    )
    last_year_lookup["Date"] = (
        last_year_lookup["Date"] +
        pd.DateOffset(years=1)
    )
    df = df.merge(
        last_year_lookup,
        on=[
            "ItemID",
            "LocationID",
            "Date"
        ],
        how="left"
    )
    df["Qty_SameDayLastYear"] = (
        df["Qty_SameDayLastYear"]
        .fillna(0)
    )

    epsilon = 1

    df["YoY_GrowthRate"] = (
        (
            df["QtyConsumptionToday"] -
            df["Qty_SameDayLastYear"]
        )
        /
        (
            df["Qty_SameDayLastYear"] +
            epsilon
        )
    )

    df["YoY_GrowthRate"] = (
        df["YoY_GrowthRate"]
        .clip(-5, 5)
    )

    df = df.sort_values("Date")

    # for lag in [7, 14, 30]:
    #     # Build per-ItemID per-date lookup
    #     date_qty_map = df.set_index(['ItemID', 'LocationID', 'Date'])['QtyConsumptionToday']

    #     df[f'Qty_Lag{lag}D'] = df.apply(
    #         lambda row: date_qty_map.get((row['ItemID'], row['LocationID'], row['Date'] - pd.Timedelta(days=lag))),
    #         axis=1
    #     )

    df = df[df['Date'].between('2023-01-01', '2026-01-28')]

    print(df.shape)
    print(df["Date"].min())
    print(df["Date"].max())
    print('')

    df["IsHoliday"] = df["IsHoliday"].astype(int)
    df["IsHolidayEve"] = df["IsHolidayEve"].astype(int)
    df["IsWeekend"] = df["IsWeekend"].astype(int)
    df["IsWeekendEve"] = df["IsWeekendEve"].astype(int)
    df["IsPromotion"] = df["IsPromotion"].astype(int)

    return df