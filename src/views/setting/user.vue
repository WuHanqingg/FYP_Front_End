<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { Search, Plus, Delete, Edit, Refresh } from "@element-plus/icons-vue";
import {
  getUsers,
  updateUsersById,
  deleteUsersById,
  addUser
} from "@/api/BackEnd/getUser";
import { id } from "element-plus/es/locale/index.mjs";

// Define user type
interface User {
  id: number;
  username: string;
  fullName: string;
  role: "admin" | "user";
  isActive: 0 | 1;
}

// Table loading state
const loading = ref(false);

// User list
const users = ref<User[]>([]);

// Pagination parameters
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// Search keyword
const searchKeyword = ref("");

// Form instances
const formRef = ref<FormInstance>();
const resetPwdFormRef = ref<FormInstance>();

// Form data
const formData = reactive<User>({
  id: 0,
  username: "",
  fullName: "",
  role: "user",
  isActive: 1
});

// Reset password form data
const resetPwdForm = reactive({
  userId: 0,
  password: "",
  confirmPassword: ""
});

// Form rules
const rules = reactive<FormRules>({
  username: [
    { required: true, message: "Please enter username", trigger: "blur" }
  ],
  fullName: [
    { required: true, message: "Please enter full name", trigger: "blur" }
  ],
  role: [{ required: true, message: "Please select role", trigger: "change" }]
});

// Reset password form rules
const resetPwdRules = reactive<FormRules>({
  password: [
    { required: true, message: "Please enter new password", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "Please confirm new password", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== resetPwdForm.password) {
          callback(new Error("Passwords do not match"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

// Dialog states
const dialogVisible = ref(false);
const resetPwdDialogVisible = ref(false);
const dialogTitle = ref("");

// Calculate filtered users
const filteredUsers = computed(() => {
  let result = [...users.value];

  // Search
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(
      user =>
        user.username.toLowerCase().includes(keyword) ||
        user.fullName.toLowerCase().includes(keyword)
    );
  }

  // Pagination
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return result.slice(start, end);
});

// Fetch users from API
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await getUsers();
    if (response.data.data && response.data.data.list) {
      users.value = response.data.data.list;
      total.value = response.data.data.totalCount;
    }
  } catch (error) {
    ElMessage.error("Failed to fetch users");
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

// Open add user dialog
const openAddDialog = () => {
  dialogTitle.value = "Add User";
  formData.id = 0;
  formData.username = "";
  formData.fullName = "";
  formData.role = "user";
  formData.isActive = 1;
  dialogVisible.value = true;
};

// Open edit user dialog
const openEditDialog = (user: User) => {
  dialogTitle.value = "Edit User";
  formData.id = user.id;
  formData.username = user.username;
  formData.fullName = user.fullName;
  formData.role = user.role;
  formData.isActive = user.isActive;
  dialogVisible.value = true;
};

// Open reset password dialog
const openResetPwdDialog = (user: User) => {
  resetPwdForm.userId = user.id;
  resetPwdForm.password = "";
  resetPwdForm.confirmPassword = "";
  resetPwdDialogVisible.value = true;
};

// Save user
const saveUser = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      loading.value = true;
      try {
        if (formData.id === 0) {
          const res = await addUser(formData);
          if (res.data.code == 200) {
            ElMessage.success("User added successfully");
          } else {
            ElMessage.error("Failed to add user");
          }
          // Refresh user list
          await fetchUsers();
        } else {
          // Update user
          await updateUsersById(formData);
          ElMessage.success("User updated successfully");
          // Refresh user list
          await fetchUsers();
        }

        dialogVisible.value = false;
      } catch (error) {
        ElMessage.error("Operation failed, please try again");
        console.error("Error saving user:", error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// Reset password
const resetPassword = async () => {
  if (!resetPwdFormRef.value) return;

  await resetPwdFormRef.value.validate(async valid => {
    if (valid) {
      loading.value = true;

      try {
        // Implement password reset API call
        const data = {
          id: resetPwdForm.userId,
          passwordHash: resetPwdForm.password
        }
        const res = await updateUsersById(data, resetPwdForm.userId)
        if (res.data.code == 200) {
          ElMessage.success("Password reset successfully");
        } else {
          ElMessage.error("Failed to reset password");
        }
        resetPwdDialogVisible.value = false;
      } catch (error) {
        ElMessage.error("Password reset failed, please try again");
        console.error("Error resetting password:", error);
      } finally {
        loading.value = false;
      }
    }
  });
};

// Delete user
const deleteUser = (user: User) => {
  ElMessageBox.confirm(
    "Are you sure you want to delete this user?",
    "Warning",
    {
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      type: "warning"
    }
  )
    .then(async () => {
      loading.value = true;

      try {
        await deleteUsersById(user.id);
        ElMessage.success("User deleted successfully");
        // Refresh user list
        await fetchUsers();
      } catch (error) {
        ElMessage.error("Failed to delete user, please try again");
        console.error("Error deleting user:", error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      // Cancel deletion
    });
};

const switchActive = async (user: User) => {
  loading.value = true;
  try{const res = await updateUsersById(user);
  if (res.data.code == 200) {
    ElMessage.success("User status updated successfully");
  } else {
    ElMessage.error("Failed to update user status");
  }
  } catch (error) {
    ElMessage.error("Operation failed, please try again");
    console.error("Error switching user status:", error);
  } finally {
    loading.value = false;
  }
}

// Handle pagination changes
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
};

const handleCurrentChange = (current: number) => {
  currentPage.value = current;
};

// Handle search
const handleSearch = () => {
  currentPage.value = 1;
};

// Fetch users on component mount
onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-management">
    <div class="header">
      <h2>User Management</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="Search username or full name"
          clearable
          style="width: 200px; margin-right: 10px"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="openAddDialog">
          <el-icon><Plus /></el-icon>
          Add User
        </el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="filteredUsers" style="width: 100%">
      <el-table-column prop="id" label="User ID" width="80" />
      <el-table-column prop="username" label="Account" />
      <el-table-column prop="fullName" label="Nick Name" />
      <el-table-column prop="role" label="Role">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
            {{ scope.row.role === "admin" ? "Admin" : "User" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="Status">
        <template #default="scope">
          <el-switch
            v-model="scope.row.isActive"
            :active-value="1"
            :inactive-value="0"
            @change="switchActive(scope.row)"
            :disabled="scope.row.username === 'admin'"
          />
        </template>
      </el-table-column>
      <el-table-column label="Actions" width="400" fixed="right">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            style="margin-right: 5px"
            @click="openEditDialog(scope.row)"
          >
            <el-icon><Edit /></el-icon>
            Edit
          </el-button>
          <el-button
            type="warning"
            size="small"
            style="margin-right: 5px"
            @click="openResetPwdDialog(scope.row)"
          >
            <el-icon><Refresh /></el-icon>
            Reset Password
          </el-button>
          <el-button type="danger" size="small" @click="deleteUser(scope.row)">
            <el-icon><Delete /></el-icon>
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- User form dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item v-if="formData.id !== 0" label="User ID">
          <el-input v-model="formData.id" disabled />
        </el-form-item>
        <el-form-item label="Account" prop="username">
          <el-input v-model="formData.username" :disabled = "formData.id !== 0" />
        </el-form-item>
        <el-form-item label="Nick Name" prop="fullName">
          <el-input v-model="formData.fullName" />
        </el-form-item>
        <el-form-item label="Role" prop="role">
          <el-select v-model="formData.role" placeholder="Select role">
            <el-option label="Admin" value="admin" />
            <el-option label="User" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="Status">
          <el-switch
            v-model="formData.isActive"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="saveUser">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Reset password dialog -->
    <el-dialog
      v-model="resetPwdDialogVisible"
      title="Reset Password"
      width="400px"
    >
      <el-form
        ref="resetPwdFormRef"
        :model="resetPwdForm"
        :rules="resetPwdRules"
        label-width="150px"
      >
        <el-form-item label="User ID">
          <el-input v-model="resetPwdForm.userId" disabled />
        </el-form-item>
        <el-form-item label="New Password" prop="password">
          <el-input
            v-model="resetPwdForm.password"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="resetPwdForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPwdDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="resetPassword">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.user-management {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
