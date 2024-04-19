package com.chatapp.core.auth.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public enum RoleEnum {
    /*Cuando se setea el enum CUSTOMER, por ejemplo, la lista permissions contendrá solo un objeto
Permission.READ_ALL_PRODUCT entre sus  valores, si se setea ADMIN entonces la lista tendrá los
enum Permission.READ_ALL_PRODUCT y Permission.SAVE_ONE_PRODUCT*/
    CLIENT(List.of(PermissionEnum.READ)),
    DEVELOPER(Arrays.asList(PermissionEnum.CREATE, PermissionEnum.READ,PermissionEnum.UPDATE,PermissionEnum.DELETE,
            PermissionEnum.REFACTOR));
    private List<PermissionEnum> permissions;
}
