from fastapi import APIRouter, Depends, HTTPException, status
from app.services.dashboard_service import DashboardService

router = APIRouter(
    prefix="/api",
    tags=["Dashboard"]
)


def get_dashboard_service() -> DashboardService:
    """
    Dependency injector to construct and retrieve the DashboardService instance.
    """
    return DashboardService()


@router.get(
    "/dashboard",
    status_code=status.HTTP_200_OK,
    summary="Retrieve aggregated dashboard statistics",
    description=(
        "Returns real-time aggregated metrics including total diagnoses, "
        "review status counts, AI accuracy, average confidence, severity and OSI layer "
        "distributions, concept tag breakdowns, and the most common network fault. "
        "All values are computed from persisted diagnosis JSON records."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Dashboard statistics retrieved successfully."
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "An unexpected server-side exception occurred."
        }
    }
)
def get_dashboard(
    service: DashboardService = Depends(get_dashboard_service)
):
    """
    Aggregates all diagnosis records and returns structured metrics
    ready for direct consumption by the React DashboardPage component.
    """
    try:
        return service.get_dashboard_stats()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while aggregating dashboard statistics: {str(e)}"
        )
