namespace SmartInventoryAPI.Utilities.Exceptions;

public class UnauthorizedException : ApplicationException
{
    public UnauthorizedException(string? message = "Unauthorized") : base(message)
    {
    }
}
