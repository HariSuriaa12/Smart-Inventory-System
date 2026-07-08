from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from Services.ForecastService import ForecastService


app = FastAPI(
    title="Inventory Forecasting API",
    version="1.0"
)

forecast_service = ForecastService()


class ForecastRequest(BaseModel):
    forecastRunId: str


@app.get("/health")
def health_check():
    return {
        "status": "Healthy"
    }


@app.post("/api/forecast/run")
def run_forecast(
    #request: ForecastRequest
):
    try:
        result_df = forecast_service.run_forecast()

        return {
            "status": "Success",
            "rowsPredicted": len(result_df),
            "annRows": int(
                (
                    result_df["Best_Method"] == 0 #ANN
                ).sum()
            ),
            "maRows": int(
                (
                    result_df["Best_Method"] == 1 #MA
                ).sum()
            )
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
