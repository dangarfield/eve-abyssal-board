export const renderAdminHeader = () => {
  return `<ul class="nav nav-underline mb-3">
  <li class="nav-item">
    <a class="nav-link${window.location.pathname === '/admin' ? ' active disabled' : ''}" href="/admin">Admin Config</a>
  </li>
  <li class="nav-item">
    <a class="nav-link${window.location.pathname === '/admin/payments-pending' ? ' active disabled' : ''}" href="/admin/payments-pending">Pending Payments</a>
  </li>
  <li class="nav-item">
    <a class="nav-link${window.location.pathname === '/admin/payments-complete' ? ' active disabled' : ''}" href="/admin/payments-complete">Completed Payments</a>
  </li>
  <li class="nav-item">
    <a class="nav-link${window.location.pathname === '/admin/journal' ? ' active disabled' : ''}" href="/admin/journal">Corp Journal</a>
  </li>
</ul>
`
}
