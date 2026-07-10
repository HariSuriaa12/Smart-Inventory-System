using System.Net;
using System.Text.Json;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception has occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiResponseDto();

        switch (exception)
        {
            case NotFoundException notFound:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                response.StatusCode = 404;
                response.Success = false;
                response.Message = notFound.Message;
                break;

            case BadRequestException badRequest:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                response.StatusCode = 400;
                response.Success = false;
                response.Message = badRequest.Message;
                break;

            case UnauthorizedException unauthorized:
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                response.StatusCode = 401;
                response.Success = false;
                response.Message = unauthorized.Message;
                break;

            case ConflictException conflict:
                context.Response.StatusCode = StatusCodes.Status409Conflict;
                response.StatusCode = 409;
                response.Success = false;
                response.Message = conflict.Message;
                break;

            default:
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                response.StatusCode = 500;
                response.Success = false;
                response.Message = $"An internal server error occurred. {GetAllMessages(exception)}";
                break;
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        return context.Response.WriteAsJsonAsync(response, options);
    }

    public static string GetAllMessages(Exception exception)
    {
        if (exception == null) return string.Empty;

        var messages = new List<string> { exception.Message };

        var inner = exception.InnerException;
        while (inner != null)
        {
            messages.Add(inner.Message);
            inner = inner.InnerException;
        }

        return string.Join(" --> ", messages);
    }
}
