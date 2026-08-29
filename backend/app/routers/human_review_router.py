from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.review_schema import ReviewRequest, ReviewResponse
from app.services.human_review_service import HumanReviewService

router = APIRouter(
    prefix="/api",
    tags=["Human Review"]
)


def get_human_review_service() -> HumanReviewService:
    """
    Dependency injector to construct and retrieve the HumanReviewService instance.
    """
    return HumanReviewService()


@router.post(
    "/review",
    response_model=ReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit a human review decision",
    description=(
        "Accepts a human review action (Accept, Edit, or Reject) for a specific diagnosis. "
        "When the action is Edit, updated values for root cause, recommended next show command, "
        "suggested configuration changes, troubleshooting steps, and reviewer notes are persisted. "
        "The updated diagnosis record is saved to the local data store and returned."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Human review applied and diagnosis record updated successfully.",
            "model": ReviewResponse
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "An unexpected server-side exception occurred."
        }
    }
)
def submit_review(
    request: ReviewRequest,
    service: HumanReviewService = Depends(get_human_review_service)
) -> ReviewResponse:
    """
    Delegates the review decision to HumanReviewService and returns
    the updated diagnosis record.
    """
    try:
        updated = service.review_diagnosis(
            diagnosis_id=request.diagnosis_id,
            action=request.action,
            reviewer_notes=request.reviewer_notes,
            root_cause=request.root_cause,
            recommended_next_show_command=request.recommended_next_show_command,
            suggested_configuration_changes=request.suggested_configuration_changes,
            step_by_step_troubleshooting=request.step_by_step_troubleshooting
        )

        return ReviewResponse(
            diagnosis_id=updated.get("diagnosis_id", request.diagnosis_id),
            status=updated.get("status", "Pending Review"),
            reviewer_notes=updated.get("reviewer_notes"),
            root_cause=updated.get("root_cause"),
            recommended_next_show_command=updated.get("recommended_next_show_command"),
            suggested_configuration_changes=updated.get("suggested_configuration_changes"),
            step_by_step_troubleshooting=updated.get("step_by_step_troubleshooting"),
            confidence=updated.get("confidence"),
            osi_layer=updated.get("osi_layer"),
            severity=updated.get("severity")
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during human review processing: {str(e)}"
        )
