/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  TableIcon,
  UserCircleIcon,
  GroupIcon,
  PaperPlaneIcon,
} from "../icons/index";
import { UserRole } from "@/constants/user.constant";
import { IUserRole, User } from '@/types/common';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; role?: string[] }[];
  requiredRole?: string | string[];
  onClick?: () => void;
};

const AppSidebar: React.FC = () => {
  const router = useRouter();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    // Clear all user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear user state
    setUser(null);
    // Redirect to signin page
    router.push("/signin");
    setIsLoading(false);
  };

  const navItems = useMemo(() => [
  {
    icon: <GridIcon />,
    name: "Trang chủ",
    path: "/",
    requiredRole: [UserRole.Admin],
  },
  {
    icon: <TableIcon />,
    name: "Quản lý cơ cấu tổ chức",
    subItems: [
      {
        name: "Quản lý trường",
        path: "/school",
        role: [UserRole.Admin],
      },
      {
        name: "Quản lý khoa",
        path: "/faculty",
        role: [UserRole.Admin],
      },
      {
        name: "Quản lý bộ môn",
        path: "/department",
        role: [UserRole.Admin, UserRole.Rector, UserRole.FacultyDean],
      },
      {
        name: "Quản lý ngành học",
        path: "/major",
        role: [UserRole.Admin, UserRole.Rector, UserRole.FacultyDean, UserRole.DepartmentHead],
      },
      {
        name: "Quản lý năm học",
        path: "/academic-year",
        role: [UserRole.Admin],
      },
    ],
    requiredRole: [UserRole.Admin, UserRole.FacultyDean, UserRole.DepartmentHead],
  },
  {
    icon: <GroupIcon />,
    name: "Quản lý người dùng",
    subItems: [
      {
        name: "Quản lý tài khoản",
        path: "/user",
        role: [UserRole.Admin],
      },
      {
        name: "Quản lý sinh viên",
        path: "/student",
        role: [UserRole.Admin],
      },
      {
        name: "Quản lý giảng viên",
        path: "/lecturer",
        role: [UserRole.Admin],
      },
    ],
    requiredRole: [UserRole.Admin],
  },
  {
    icon: <PaperPlaneIcon />,
    name: "Quản lý kế hoạch NCKH",
    path: "/term",
    requiredRole: [UserRole.Admin, UserRole.Rector],
  },
  {
    icon: <CalenderIcon />,
    name: "Quản lý đề tài",
    path: "/project",
    requiredRole: [UserRole.Admin, UserRole.Student, UserRole.Lecturer, UserRole.DepartmentHead, UserRole.FacultyDean, UserRole.Council, UserRole.Rector],
  },
  {
    icon: <TableIcon />,
    name: "Quản lý bảo vệ đề tài",
    subItems: [
      {
        name: "Thiết lập hội đồng",
        path: "/council",
        role: [UserRole.Admin, UserRole.Rector, UserRole.FacultyDean],
      },
      {
        icon: <CalenderIcon />,
        name: "Đăng ký bảo vệ đề tài",
        path: "/booking",
        requiredRole: [UserRole.Admin, UserRole.Rector, UserRole.FacultyDean, UserRole.DepartmentHead, UserRole.Lecturer, UserRole.Student, UserRole.Council],
      },
      {
        name: "Lưu trữ",
        path: "/archive",
        role: [UserRole.Admin, UserRole.Rector, UserRole.FacultyDean, UserRole.DepartmentHead, UserRole.Lecturer, UserRole.Student, UserRole.Council],
      }
    ],
    requiredRole: [UserRole.Admin, UserRole.Rector, UserRole.FacultyDean, UserRole.DepartmentHead, UserRole.Lecturer, UserRole.Student, UserRole.Council],
  },
  {
    icon: <UserCircleIcon />,
    name: "Trang cá nhân",
    path: "/profile",
    requiredRole: [UserRole.Admin, UserRole.Student, UserRole.Lecturer, UserRole.DepartmentHead, UserRole.FacultyDean, UserRole.Council, UserRole.Rector],
  },
  {
    icon: (<svg
      className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
        fill=""
      />
    </svg>),
    name: "Đăng xuất",
    onClick: handleLogout,
    requiredRole: [UserRole.Admin, UserRole.Student, UserRole.Lecturer, UserRole.DepartmentHead, UserRole.FacultyDean, UserRole.Council],
  },
  ], [user?.userRoles]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const hasAccess = (requiredRole: string | string[]) => {
    if (!user || !user.userRoles) return false;

    if (Array.isArray(requiredRole)) {
      const rolesMapping: Record<string, boolean> = {};
      user.userRoles.forEach((userRole) => {
        rolesMapping[userRole.role.name] = true;
      });

      return requiredRole.some((role) => rolesMapping[role]);
    }

    // For single role check, check if user has any of the required roles
    return user.userRoles.some((userRole: IUserRole) => userRole.role.name === requiredRole);
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => {
        if (nav.requiredRole && !hasAccess(nav.requiredRole)) {
          return null;
        }

        return (
          <li key={nav.name}>
            {nav.onClick ? (
              <button
                onClick={nav.onClick}
                className={`menu-item group menu-item-inactive cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
              >
                <span className="menu-item-icon-inactive">{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </button>
            ) : 'subItems' in nav && Array.isArray(nav.subItems) ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                  }`}
              >
                <span
                  className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                      }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                >
                  <span
                    className={`${isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                      }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => {
                    if (subItem.role && !hasAccess(subItem.role)) {
                      return null;
                    }

                    return (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item ${isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                            }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge `}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                                  } menu-dropdown-badge `}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);



  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={300}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={300}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                renderMenuItems(navItems, "main")
              )}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
