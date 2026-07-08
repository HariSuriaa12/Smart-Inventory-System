namespace SmartInventoryAPI.Utilities.Exceptions;

public class BadRequestException : ApplicationException
{
    public BadRequestException(string? message = "Invalid request") : base(message)
    {
    }
}
