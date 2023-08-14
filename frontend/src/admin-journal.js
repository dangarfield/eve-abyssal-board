import { initAdmin } from './admin'
import { isLoginPasswordSet } from './auth'
import { getJournalAdmin, getAppAuth } from './board-api'
import { clearData } from './utils'
import { Grid, h } from 'gridjs'
import { renderAdminHeader } from './component/admin-header'

const renderAdminJournal = (journal) => {
  console.log('renderAdminJournal', journal)

  let html = ''
  html += `
  <div class="container pt-3">
    <div class="row">
      <div class="col">
        ${renderAdminHeader()}
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="journal-grid"></div>
      </div>
    </div>
  </div>`
  document.querySelector('.content').innerHTML = html

  const journalCol = journal.map((p, i) => [
    i,
    p.id,
    p.date,

    p.ref_type,

    p.second_party_id,
    p.first_party_id,

    p.description,
    p.reason,
    p.amount,
    p.balance
  ])
  console.log('journalCol', journalCol)
  new Grid({
    columns: [
      { name: 'i', hidden: true },
      { name: 'ID', sort: true },
      { name: 'Date', sort: true },
      { name: 'Ref Type', sort: true },
      { name: 'To', sort: true },
      { name: 'From', sort: true },
      { name: 'Description', sort: true },
      { name: 'Reason', sort: true },
      { name: 'Amount', sort: true },
      { name: 'Balance', sort: true }
    ],
    data: journalCol,
    search: true
  }).render(document.querySelector('.journal-grid'))
}

export const initAdminJournal = async () => {
  console.log('initAdminJournal')
  //   clearData('admin-password')
  if (isLoginPasswordSet()) {
    console.log('initAdmin - LOGGED IN')
    const appAuth = await getAppAuth()
    console.log('appAuth', appAuth)
    if (appAuth.error) {
      console.log('BAD LOGIN', appAuth)
      clearData('admin-password')
      initAdmin()
    } else {
      // const appConfig = await getAppConfigAdmin()
      console.log('LOGGED IN!!! ADMIN PAYMENTS', appAuth)
      const journal = await getJournalAdmin()
      renderAdminJournal(journal)
    }
    // TODO is null, password is bad, clear password and reload page
  } else {
    console.log('initAdmin - NOT LOGGED IN')
    // triggerAdminLoginFlow()
    window.location.assign('/admin')
  }
}
