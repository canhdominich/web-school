# Components Phân Trang

Bộ component phân trang được thiết kế để tái sử dụng cao và dễ dàng tích hợp vào các bảng dữ liệu khác nhau.

## Components Chính

### 1. Pagination
Component phân trang cơ bản với điều khiển trang và selector số lượng item trên mỗi trang.

```tsx
import Pagination, { PaginationInfo } from "@/components/common/Pagination";

const paginationInfo: PaginationInfo = {
  currentPage: 1,
  totalPages: 10,
  totalItems: 100,
  itemsPerPage: 10,
  hasNext: true,
  hasPrev: false,
};

<Pagination
  pagination={paginationInfo}
  onPageChange={(page) => setCurrentPage(page)}
  onItemsPerPageChange={(limit) => setItemsPerPage(limit)}
/>
```

### 2. DataTable
Component bảng dữ liệu cơ bản với hỗ trợ phân trang.

```tsx
import DataTable from "@/components/common/DataTable";

<DataTable
  headers={headers}
  items={items}
  renderRow={(item) => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.description}</TableCell>
    </TableRow>
  )}
  pagination={paginationInfo}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
/>
```

### 3. SearchableDataTable
Component bảng dữ liệu hoàn chỉnh với tìm kiếm và phân trang.

```tsx
import SearchableDataTable from "@/components/common/SearchableDataTable";

<SearchableDataTable
  headers={headers}
  items={items}
  renderRow={renderRow}
  searchTerm={searchTerm}
  onSearch={handleSearch}
  searchPlaceholder="Tìm kiếm..."
  isSearching={isSearching}
  pagination={paginationInfo}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
  actionButton={<button>Thêm mới</button>}
  onRefresh={handleRefresh}
/>
```

## Hook usePagination

Hook quản lý state phân trang với các utility functions.

```tsx
import { usePagination } from "@/hooks/usePagination";

const {
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  paginationInfo,
  handlePageChange,
  handleItemsPerPageChange,
  resetToFirstPage,
  hasNext,
  hasPrev,
} = usePagination({
  initialPage: 1,
  initialItemsPerPage: 10,
});
```

## Cách Sử Dụng Cho Các Bảng Khác

### 1. Tạo Service với Phân Trang

```tsx
// userService.ts
export interface SearchUserDto {
  name?: string;
  email?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUserResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const getUsers = async (searchParams?: SearchUserDto): Promise<PaginatedUserResponse> => {
  const params = new URLSearchParams();
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  // Always include default pagination
  if (!searchParams?.page) params.set('page', '1');
  if (!searchParams?.limit) params.set('limit', '10');
  
  const queryString = params.toString();
  const url = queryString ? `/users?${queryString}` : '/users';
  
  const res = await httpClient.get(url);
  return res.data;
};
```

### 2. Tạo Component DataTable

```tsx
// UserDataTable.tsx
import SearchableDataTable from "@/components/common/SearchableDataTable";

export default function UserDataTable({ 
  headers, 
  items, 
  searchTerm, 
  onSearch, 
  isSearching, 
  pagination, 
  onPageChange, 
  onItemsPerPageChange, 
  onRefresh 
}: UserDataTableProps) {
  
  const renderRow = (user: User) => (
    <TableRow key={user.id}>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <button onClick={() => handleEdit(user)}>Sửa</button>
        <button onClick={() => handleDelete(user.id)}>Xóa</button>
      </TableCell>
    </TableRow>
  );

  const actionButton = (
    <button onClick={openModal}>Thêm người dùng</button>
  );

  return (
    <SearchableDataTable
      headers={headers}
      items={items}
      renderRow={renderRow}
      searchTerm={searchTerm}
      onSearch={onSearch}
      searchPlaceholder="Tìm kiếm theo tên hoặc email..."
      isSearching={isSearching}
      pagination={pagination}
      onPageChange={onPageChange}
      onItemsPerPageChange={onItemsPerPageChange}
      actionButton={actionButton}
      onRefresh={onRefresh}
    />
  );
}
```

### 3. Sử Dụng Trong Page

```tsx
// user/page.tsx
export default function UserPage() {
  const {
    currentPage,
    itemsPerPage,
    paginationInfo,
    handlePageChange,
    handleItemsPerPageChange,
    setTotalItems,
    setTotalPages,
    setCurrentPage,
    resetToFirstPage,
  } = usePagination();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async (params?: SearchUserDto) => {
    try {
      setIsLoading(true);
      const searchParams: SearchUserDto = {
        ...params,
        page: currentPage,
        limit: itemsPerPage,
      };
      
      const data = await getUsers(searchParams);
      setUsers(data.data);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
    } catch (e) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, setTotalItems, setTotalPages, setCurrentPage]);

  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query.trim());
    resetToFirstPage();
    fetchUsers({ name: query.trim() });
  }, [fetchUsers, resetToFirstPage]);

  useEffect(() => {
    fetchUsers({});
  }, [fetchUsers]);

  useEffect(() => {
    if (!isLoading) {
      fetchUsers({});
    }
  }, [currentPage, itemsPerPage]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý người dùng" />
      <ComponentCard title="">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <UserDataTable 
            headers={headers} 
            items={users} 
            searchTerm={searchTerm}
            onSearch={handleSearch}
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onRefresh={() => fetchUsers({})}
          />
        )}
      </ComponentCard>
    </div>
  );
}
```

## Tính Năng

- ✅ Phân trang với điều khiển trang
- ✅ Thay đổi số lượng item trên mỗi trang
- ✅ Tìm kiếm với loading state
- ✅ Empty state cho dữ liệu trống
- ✅ Responsive design
- ✅ Dark mode support
- ✅ TypeScript support
- ✅ Tái sử dụng cao
- ✅ Không sử dụng any type

## Lưu Ý

1. **API Response**: API phải trả về dữ liệu theo format `PaginatedResponse`
2. **Search Reset**: Khi tìm kiếm, trang sẽ tự động reset về trang đầu tiên
3. **Items Per Page**: Khi thay đổi số lượng item trên mỗi trang, trang sẽ reset về trang đầu tiên
4. **Loading State**: Component tự động xử lý loading state cho tìm kiếm và phân trang
