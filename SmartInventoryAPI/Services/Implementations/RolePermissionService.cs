using AutoMapper;
using Microsoft.AspNetCore.Identity;
using SmartInventoryAPI.Models.DTOs.Request.RolePermission;
using SmartInventoryAPI.Models.DTOs.Response;
using SmartInventoryAPI.Models.Entities;
using SmartInventoryAPI.Repositories.Interfaces;
using SmartInventoryAPI.Services.Interfaces;
using SmartInventoryAPI.Utilities.Exceptions;

namespace SmartInventoryAPI.Services.Implementations;

public class RolePermissionService : IRolePermissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<RolePermissionService> _logger;

    public RolePermissionService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<RolePermissionService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<RolePermissionDto> CreateRolePermissionAsync(CreateRolePermissionRequestDto request)
    {
        //var existingRole = await _unitOfWork.RolePermissions.GetByRoleIdAsync(request.Role_ID);
        var existingRole = await _unitOfWork.RolePermissions.GetByRoleNameAsync(request.Role_Name ?? "");
        if (existingRole != null)
            throw new InvalidOperationException($"Role with ID {request.Role_ID} already exists");

        var rolePermission = _mapper.Map<RolePermission>(request);
        rolePermission.created_at = DateTime.UtcNow;
        rolePermission.updated_at = DateTime.UtcNow;

        var createdRole = await _unitOfWork.RolePermissions.AddAsync(rolePermission);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Role Permission {RoleID} created successfully with name {RoleName}",
            rolePermission.role_id, rolePermission.role_name);
        return _mapper.Map<RolePermissionDto>(createdRole);
    }

    public async Task<RolePermissionDto> GetRolePermissionByIdAsync(int id)
    {
        var rolePermission = await _unitOfWork.RolePermissions.GetByIdIntAsync(id);
        if (rolePermission == null)
            throw new NotFoundException("Role permission not found");

        return _mapper.Map<RolePermissionDto>(rolePermission);
    }

    public async Task<RolePermissionDto> GetRolePermissionByRoleIdAsync(int roleId)
    {
        var rolePermission = await _unitOfWork.RolePermissions.GetByRoleIdAsync(roleId);
        if (rolePermission == null)
            throw new NotFoundException($"Role permission for role ID {roleId} not found");

        return _mapper.Map<RolePermissionDto>(rolePermission);
    }

    public async Task<PaginatedResponseDto<RolePermissionDto>> GetAllRolePermissionsAsync(int skip = 0, int take = 10)
    {
        IEnumerable<RolePermission> rolePermissions;
        var total = 0;
        var page = 0;
        var totalPages = 0;

        if (take > 0)
        {
            rolePermissions = await _unitOfWork.RolePermissions.GetAllAsync(skip, take);
            total = await _unitOfWork.RolePermissions.CountAsync();
            page = (skip / take) + 1;
            totalPages = (int)Math.Ceiling((double)total / take);
        }
        else
        {
            rolePermissions = await _unitOfWork.RolePermissions.GetAllAsync();
            total = rolePermissions.Count();
        }

        return new PaginatedResponseDto<RolePermissionDto>
        {
            Data = _mapper.Map<IEnumerable<RolePermissionDto>>(rolePermissions),
            Total = total,
            Skip = skip,
            Take = take,
            Page = page,
            TotalPages = totalPages,
            HasNextPage = skip + take < total,
            HasPreviousPage = skip > 0
        };
    }

    public async Task<IEnumerable<RolePermissionDto>> GetActiveRolesAsync()
    {
        var activeRoles = await _unitOfWork.RolePermissions.GetActiveRolesAsync();
        return _mapper.Map<IEnumerable<RolePermissionDto>>(activeRoles);
    }

    public async Task<RolePermissionDto> UpdateRolePermissionAsync(int id, UpdateRolePermissionRequestDto request)
    {
        var rolePermission = await _unitOfWork.RolePermissions.GetByIdIntAsync(id);
        if (rolePermission == null)
            throw new NotFoundException("Role permission not found");

        _mapper.Map(request, rolePermission);
        rolePermission.updated_at = DateTime.UtcNow;
        rolePermission.created_at = DateTime.SpecifyKind(rolePermission.created_at, DateTimeKind.Utc);

        await _unitOfWork.RolePermissions.UpdateAsync(rolePermission);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Role Permission {ID} updated successfully", id);
        return _mapper.Map<RolePermissionDto>(rolePermission);
    }

    public async Task DeleteRolePermissionAsync(int id)
    {
        var rolePermission = await _unitOfWork.RolePermissions.GetByIdAsync(id);
        if (rolePermission == null)
            throw new NotFoundException("Role permission not found");

        var userCount = await _unitOfWork.RolePermissions.CountUsersWithRoleAsync(rolePermission.role_id);
        if (userCount > 0)
            throw new InvalidOperationException($"Cannot delete role. {userCount} user(s) are assigned to this role");

        rolePermission.updated_at = DateTime.UtcNow;
        rolePermission.created_at = DateTime.SpecifyKind(rolePermission.created_at, DateTimeKind.Utc);

        await _unitOfWork.RolePermissions.DeleteAsync(id);
        await _unitOfWork.SaveAsync();

        _logger.LogInformation("Role Permission {ID} deleted successfully", id);
    }

    public async Task<bool> CanDeleteRoleAsync(int id)
    {
        var userCount = await _unitOfWork.RolePermissions.CountUsersWithRoleAsync(id);
        return userCount == 0;
    }
}
