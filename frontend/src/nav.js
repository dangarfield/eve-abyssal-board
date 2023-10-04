import { switchUser, triggerLoginFlow, getCurrentUserDetails } from './auth'
import { clearAllData, loadData, saveData } from './utils'

export const initNav = () => {
//   console.log('initNav')
  const data = loadData()
  const { characterId, characterName } = getCurrentUserDetails()
  if (characterId !== undefined) {
    console.log('nav', characterId, characterName)

    const availableCharacters = Object.keys(data)
      .filter(key => key.startsWith('token-'))
      .map(key => { return { characterId: data[key].character_id, characterName: data[key].payload.name } })
    //   console.log('availableCharacters', availableCharacters)

    let html = ''
    for (const availableCharacter of availableCharacters) {
      html +=
      `<li>
        <button class="dropdown-item d-flex align-items-center switch-user" character-id="${availableCharacter.characterId}">
          <img src="https://image.eveonline.com/Character/${availableCharacter.characterId}_32.jpg" class="rounded">
          <span class="ps-2">${availableCharacter.characterName}</span>
        </button>
      </li>
      <li>
        <hr class="dropdown-divider">
      </li>`
    }
    document.querySelector('.logged-in-users').innerHTML = html
    document.querySelector('.logged-in-user-img').setAttribute('src', `https://image.eveonline.com/Character/${characterId}_32.jpg`)
    document.querySelector('.logged-in-user-name').textContent = characterName

    for (const switchUserBtn of [...document.querySelectorAll('.switch-user')]) {
      switchUserBtn.addEventListener('click', function () {
        const characterId = this.getAttribute('character-id')
        //   console.log('switchUserBtn', characterId)
        switchUser(characterId)
      })
    }
    document.querySelector('.logout').addEventListener('click', () => {
      console.log('logout')
      clearAllData()
      window.location.reload()
    })

    document.querySelector('.not-logged-in').style.display = 'none'
    document.querySelector('.logged-in').style.display = 'block'
  }
  for (const loginEle of [...document.querySelectorAll('.login')]) {
    loginEle.addEventListener('click', () => {
    // console.log('login')
      triggerLoginFlow()
    })
  }
}
export const initTheme = () => {
  document.querySelector('.dark-mode').addEventListener('click', (event) => {
    const currentTheme = document.querySelector('html').getAttribute('data-bs-theme')
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark'
    console.log('dark-mode', currentTheme, newTheme, event.target)
    document.querySelector('html').setAttribute('data-bs-theme', newTheme)
    document.querySelector('.dark-mode').innerHTML = currentTheme === 'dark' ? '<i class="bi bi-moon"></i>' : '<i class="bi bi-sun-fill"></i>'
    saveData('theme', newTheme)
  })
  const data = loadData()
  const currentTheme = document.querySelector('html').getAttribute('data-bs-theme')
  if (data.theme && data.theme !== currentTheme) {
    document.querySelector('.dark-mode').click()
  }
}
