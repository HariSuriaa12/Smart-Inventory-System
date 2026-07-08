namespace SmartInventoryAPI.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;
        var request = context.Request;

        _logger.LogInformation(
            "Incoming request: {Method} {Path} from {RemoteIP}",
            request.Method,
            request.Path,
            context.Connection.RemoteIpAddress);

        await _next(context);

        var duration = DateTime.UtcNow - startTime;
        _logger.LogInformation(
            "Response: {Method} {Path} - Status: {StatusCode} - Duration: {Duration}ms",
            request.Method,
            request.Path,
            context.Response.StatusCode,
            duration.TotalMilliseconds);
    }
}
