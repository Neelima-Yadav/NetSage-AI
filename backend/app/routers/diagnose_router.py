from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.diagnosis_schema import DiagnoseRequest, DiagnoseResponse
from app.services.diagnosis_service import DiagnosisService

router = APIRouter(
    prefix="/api",
    tags=["Diagnosis"]
)

def get_diagnosis_service() -> DiagnosisService:
    """
    Dependency injector to construct and retrieve the DiagnosisService instance.
    """
    return DiagnosisService()

@router.post(
    "/diagnose",
    response_model=DiagnoseResponse,
    status_code=status.HTTP_200_OK,
    summary="Diagnose Cisco Packet Tracer faults",
    description=(
        "Accepts network symptoms, show command logs, topology notes, and concept tags "
        "to run validation rule checks and generate root causes and suggested configuration adjustments."
    ),
    responses={
        status.HTTP_200_OK: {
            "description": "Diagnostic evaluation completed successfully.",
            "model": DiagnoseResponse
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "description": "An unexpected server-side exception occurred."
        }
    }
)
def diagnose_network(
    request: DiagnoseRequest,
    service: DiagnosisService = Depends(get_diagnosis_service)
) -> DiagnoseResponse:
    """
    Processes the show command output and symptomatology to isolate root cause,
    affected OSI layer, confidence levels, and suggestions.
    """
    try:
        return service.diagnose(request)
    except Exception as e:
        # Wrap unexpected execution blocks and return HTTP 500 error payload
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during network validation checks: {str(e)}"
        )


@router.get(
    "/diagnose/{diagnosis_id}",
    response_model=DiagnoseResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve a persisted diagnosis",
    description="Returns the complete diagnosis record for a system-generated diagnosis ID.",
)
def get_diagnosis(
    diagnosis_id: str,
    service: DiagnosisService = Depends(get_diagnosis_service),
) -> DiagnoseResponse:
    """Retrieve one diagnosis through the diagnosis service storage boundary."""
    try:
        diagnosis = service.get_diagnosis(diagnosis_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis not found.",
        )
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to retrieve diagnosis: {str(error)}",
        )

    if diagnosis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis not found.",
        )

    return diagnosis
