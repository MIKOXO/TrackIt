import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/user/Sidebar'
import DashboardNavbar from '../../components/user/DashboardNavbar'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar } from '../../store/slices/layoutSlice'

const UserLayout = () => {
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((state) => state.layout.sidebarOpen)
  const mainPadding = sidebarOpen ? 'lg:pl-[256px]' : 'lg:pl-[96px]'
  const handleToggleSidebar = () => dispatch(toggleSidebar())

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-trackit-background relative overflow-x-hidden">
      <DashboardNavbar sidebarOpen={sidebarOpen} onToggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />
      <main
        className={`w-full transition-all duration-300 ${mainPadding} pt-20 px-4 sm:px-6 lg:pr-8`}
        style={{ minHeight: 'calc(100vh - 80px)' }}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default UserLayout
