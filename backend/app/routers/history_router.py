from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.services.history_service import HistoryService

router = APIRouter(
    prefix="/api",
    tags=["History"]
)


def get_history_service() -> HistoryService:
    """
    Dependency injector to construct and retrieve the HistoryService instance.
    """
    return HistoryService()


@router.get(
    "/history",
    status_code=status.HTTP_200_OK,
    summary="Retrieve diagnosis audit history",
    description=(
        "Returns a chronologically sorted list of all past diagnosis records. "
        "Supports optional filtering by review status, concept tag, severity level, "
        "and free-text search across diagnosis IDs, root causes, and network symptoms."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Diagnosis history retrieved and filtered successfully."
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "An unexpected server-side exception occurred."
        }
    }
)
def get_history(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by review status (Pending Review, Accepted, Edited, Rejected)."
    ),
    concept_tag: Optional[str] = Query(
        None,
        description="Filter by concept tag (VLAN, Routing, DHCP, DNS, ACL, NAT, Wireless)."
    ),
    severity: Optional[str] = Query(
        None,
        description="Filter by severity level (Critical, High, Medium, Low)."
    ),
    search: Optional[str] = Query(
        None,
        description="Free-text search across diagnosis ID, root cause, and network symptom."
    ),
    service: HistoryService = Depends(get_history_service)
):
    """
    Delegates filtering and search to HistoryService and returns the resulting records.
    """
    try:
        return service.get_history(
            status=status_filter,
            concept_tag=concept_tag,
            severity=severity,
            search_query=search
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while retrieving diagnosis history: {str(e)}"
        )
