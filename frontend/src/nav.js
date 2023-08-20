import { switchUser, triggerLoginFlow, getCurrentUserDetails } from './auth'
import { clearAllData, loadData } from './utils'

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
    html += `<a class="nav-link dropdown-toggle login-dropdown" href="#" role="button" data-bs-toggle="dropdown"
        aria-expanded="false">
        <img src="https://image.eveonline.com/Character/${characterId}_32.jpg" height="32px"
            class="avatar mr-0" id="current_character_avatar">
        <span class="align-middle">${characterName}</span>
    </a>
    <ul class="dropdown-menu dropdown-menu-end">`
    for (const availableCharacter of availableCharacters) {
      html += `
        <li>
            <button class="dropdown-item switch-user" type="button" character-id="${availableCharacter.characterId}">
                <img src="https://image.eveonline.com/Character/${availableCharacter.characterId}_32.jpg" height="32px"
                    class="avatar mr-0" id="current_character_avatar">
                <span class="align-middle">${availableCharacter.characterName}</span>
            </button>
        </li>`
    }
    html += `
      <li>
          <button class="dropdown-item login" type="button">
              <span class="align-middle" id="current_character_name">Add character</span><br/>
              <img src="https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-small.png"
                  alt="EVE SSO Login Buttons Small Black">
          </button>
      </li>
      <li>
        <button class="dropdown-item logout" type="button">
            <span class="align-middle">Log out</span>
        </button>
      </li>
    </ul>`

    document.querySelector('.nav-dropdown-holder').innerHTML = html

    // eslint-disable-next-line no-new
    new window.bootstrap.Dropdown(document.querySelector('.dropdown-toggle.login-dropdown'))

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
  }

  document.querySelector('.login').addEventListener('click', () => {
    // console.log('login')
    triggerLoginFlow()
  })
}
