import pandas as pd
import numpy as np
import joblib

from sqlalchemy import text
from tensorflow.keras.models import load_model

from Database.DatabaseConnection import engine
import Helper.FormatDataForANN as FormatDataForANN
import Helper.EnumModel as EnumModel


class ForecastService:

    def __init__(self):
        # Load once when FastAPI starts, not once per request.
        self.model = load_model(
            "inventory_forecast_model.keras"
        )

        self.preprocessor = joblib.load(
            "inventory_preprocessor.pkl"
        )

    def get_forecasting_features(self) -> pd.DataFrame:

        query = text("""
            SELECT
                "ItemID",
                "LocationID",
                "ItemCategory",
                "LocationType",
                --"LocationTierRank",
                --"DayOfWeek",
                "DayOfMonth",
                "Month",
                "Year",
                "IsHoliday",
                "IsHolidayEve",
                --"DaysUntilNextHoliday",
                --"DaysSinceLastHoliday",
                "IsWeekend",
                "IsWeekendEve",
                "IsPromotion",
                --"LocationAvgDailyDemand",
                "QtyConsumptionToday",
                --"QtyConsumptionYesterday",
                --"QtyConsumptionPast7Days",
                --"QtyConsumptionPast14Days",
                "QtyConsumptionPast30Days",
                --"AvgQtyConsumptionPast7Days",
                --"AvgQtyConsumptionPast14Days",
                "AvgQtyConsumptionPast30Days",
                --"DemandTrend7vs30",
                "DemandTrend14vs30"
                --"StdDevPast7Days",
                --"StdDevPast30Days",
                --"MaxQtyPast30Days",
                --"MinQtyPast30Days",
                --"CoeffOfVariationPast30Days",
            --FROM "Forecast_Input_Data"
            FROM "Model_Training_Data" WHERE ("Year" = 2025 AND "Month" > 11) OR ("Year" = 2026 AND "Month" < 12)
            ORDER BY "ItemID", "LocationID"
        """)

        return pd.read_sql(
            query,
            engine,
        )

    def get_model_selectionV2(self) -> pd.DataFrame:

        query = text("""
            SELECT
                "ItemID",
                "LocationID",
                "Best_Method",
                "ValidatedDate"
            FROM "Model_Comparison"
        """)

        selection_df = pd.read_sql(query, engine)

        return selection_df

    def get_model_selection(
        self,
        forecast_df: pd.DataFrame
    ) -> pd.DataFrame:

        item_location_pairs = forecast_df[
            [
                "ItemID",
                "LocationID"
            ]
        ].drop_duplicates()

        item_ids = item_location_pairs[
            "ItemID"
        ].tolist()

        location_ids = item_location_pairs[
            "LocationID"
        ].tolist()

        query = text("""
            SELECT
                "ItemID",
                "LocationID",
                "Best_Method",
                "ValidatedDate"
            FROM "Model_Comparison"
            WHERE "ItemID" = ANY(:item_ids)
              AND "LocationID" = ANY(:location_ids)
        """)

        selection_df = pd.read_sql(
            query,
            engine,
            params={
                "item_ids": item_ids,
                "location_ids": location_ids
            }
        )

        return selection_df

    def run_ann_forecast(
        self,
        ann_df: pd.DataFrame
    ) -> np.ndarray:

        # # Uses the same feature engineering function used during training.
        # formatted_df = FormatDataForANN.FormatDataFrame(
        #     ann_df
        # )

        feature_columns = [
            "ItemCategory",
            "LocationType",
            "ItemID",
            "LocationID",
            "DayOfMonth",
            "MonthsSinceStart",
            "IsHoliday",
            "IsHolidayEve",
            "IsWeekend",
            "IsWeekendEve",
            "IsPromotion",
            "IsPaydayWindow",
            "QtyConsumptionToday",
            "AvgQtyConsumptionPast30Days",
            "DemandTrend14vs30",
            "Qty_SameDayLastYear",
        ]

        ann_input_df = ann_df[
                feature_columns
            ].copy()

        # These columns must match the ANN training code exactly.
        ann_input_df = ann_input_df.drop(
            columns=[
                "Date",
                "ForecastDate"
            ],
            errors="ignore"
        )

        transformed_features = self.preprocessor.transform(
            ann_input_df
        )

        log_predictions = self.model.predict(
            transformed_features,
            verbose=0
        )

        predictions = np.expm1(
            log_predictions
        ).flatten()

        # Forecast quantity cannot be negative.
        return np.maximum(predictions, 0)

    def run_ma_forecast(
        self,
        ma_df: pd.DataFrame
    ) -> np.ndarray:

        # Current MA baseline:
        # Past 30-day demand is used as the next 30-day forecast.
        predictions = ma_df[
            "QtyConsumptionPast30Days"
        ].fillna(0).to_numpy()

        return np.maximum(predictions, 0)

    def save_forecast_results(
        self,
        result_df: pd.DataFrame
    ) -> None:

        insert_query = text("""
            INSERT INTO "Forecasted_Result"
            (
                "Item_ID",
                "Location_ID",
                "Forecasted_Period_In_Days",
                "Forecast_Method",
                "Forecasted_Quantity",
                "Model_Version",
                "Creation_Date"
            )
            VALUES
            (
                :ItemID,
                :LocationID,
                30,
                :Best_Method,
                :PredictedDemandNext30Days,
                '',
                NOW()
            )
        """)

        result_records = result_df.to_dict(
            orient="records"
        )

        with engine.begin() as connection:
            # Prevent duplicate results if the same run is retried.
            # forecast_run_id = int(
            #     result_df["ForecastRunID"].iloc[0]
            # )

            connection.execute(
                text("""
                    DELETE FROM "Forecasted_Result"
                """)
            )

            connection.execute(
                insert_query,
                result_records
            )

    def get_latest_forecast_row_per_item_location(
    self,
    forecast_df: pd.DataFrame
    ) -> pd.DataFrame:

        forecast_df["Date"] = pd.to_datetime(
            forecast_df["Date"]
        )

        latest_rows = (
            forecast_df
            .sort_values(
                [
                    "ItemID",
                    "LocationID",
                    "Date"
                ]
            )
            .groupby(
                [
                    "ItemID",
                    "LocationID"
                ],
                as_index=False
            )
            .tail(1)
            .copy()
        )

        return latest_rows

    def run_forecast(self) -> pd.DataFrame:

        forecast_df = self.get_forecasting_features()

        # Uses the same feature engineering function used during training.
        forecast_df = FormatDataForANN.FormatDataFrame(
            forecast_df
        )

        forecast_df = self.get_latest_forecast_row_per_item_location(
            forecast_df
        )

        if forecast_df.empty:
            raise ValueError(
                "No Forecasting_Features found for this ForecastRunID."
            )

        selection_df = self.get_model_selectionV2()

        merged_df = forecast_df.merge(
            selection_df,
            on=[
                "ItemID",
                "LocationID"
            ],
            how="left"
        )

        # New ItemID + LocationID combinations may not exist
        # in Model_Selection yet. Use MA as the safe fallback.
        merged_df["Best_Method"] = (
            merged_df["Best_Method"]
            .fillna("MA")
            .str.upper()
        )

        ann_df = merged_df[
            merged_df["Best_Method"] == "ANN"
        ].copy()

        ma_df = merged_df[
            merged_df["Best_Method"] != "ANN"
        ].copy()

        result_frames = []

        if not ann_df.empty:
            ann_df[
                "PredictedDemandNext30Days"
            ] = self.run_ann_forecast(
                ann_df
            )

            ann_df["Best_Method"] = "ANN"

            result_frames.append(
                ann_df[
                    [
                        "Date",
                        "ItemID",
                        "LocationID",
                        "Best_Method",
                        "PredictedDemandNext30Days"
                    ]
                ]
            )

        if not ma_df.empty:
            ma_df[
                "PredictedDemandNext30Days"
            ] = self.run_ma_forecast(
                ma_df
            )

            ma_df["Best_Method"] = "MA"

            result_frames.append(
                ma_df[
                    [
                        "Date",
                        "ItemID",
                        "LocationID",
                        "Best_Method",
                        "PredictedDemandNext30Days"
                    ]
                ]
            )

        result_df = pd.concat(
            result_frames,
            ignore_index=True
        )

        result_df[
            "PredictedDemandNext30Days"
        ] = result_df[
            "PredictedDemandNext30Days"
        ].round(2)

        # 1. See the exact unique strings in your column
        # print("Unique strings in column:", result_df['Best_Method'].unique().tolist())

        #Change ANN or MA to 1 or 0
        mapping = {method.name: method.value for method in EnumModel.ForecastMethod}
        result_df['Best_Method'] = result_df['Best_Method'].str.strip().map(mapping)

        # # 1. See the exact unique strings in your column
        # print("Unique strings in column:", result_df['Best_Method'].unique().tolist())

        # # 2. See what your Enum actually outputs for ANN
        # print("What ANN actually equals:", EnumModel.ForecastMethod['ANN'].value)
        # print("What MA actually equals:", EnumModel.ForecastMethod['MA'].value)

        self.save_forecast_results(
            result_df
        )

        return result_df
