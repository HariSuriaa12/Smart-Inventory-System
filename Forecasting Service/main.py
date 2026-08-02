from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from Services.ForecastService import ForecastService


app = FastAPI(
    title="Inventory Forecasting API",
    version="1.0"
)

origins = [
    "http://localhost:3000",  # Your frontend port
    # "http://127.0.0.1:3000", # Optional: add this if you use the IP address alternatively
]

# 2. Add the CORSMiddleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows requests from your frontend origin
    allow_credentials=True,           # Allows cookies and authentication headers
    allow_methods=["*"],              # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allows all headers
)

forecast_service = ForecastService()


class ForecastRequest(BaseModel):
    location_id: int


@app.get("/health")
def health_check():
    return {
        "status": "Healthy"
    }


@app.post("/api/forecast/run/location/{location_id}")
def run_forecast(
    location_id: int
):
    try:
        result_df = forecast_service.run_forecast(location_id=location_id)

        data_records = result_df.to_dict(orient="records")

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
            ),
            "data": data_records
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
