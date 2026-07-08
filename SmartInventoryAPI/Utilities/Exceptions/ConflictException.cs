namespace SmartInventoryAPI.Utilities.Exceptions;

public class ConflictException : ApplicationException
{
    public ConflictException(string? message = "Conflict occurred") : base(message)
    {
    }
}
