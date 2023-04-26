// site.ts

const style = (config) => `

    .list-container {
        display: flex;
        flex-direction: row;
        overflow: hidden;
    }

    .list {
        flex: 1;
        overflow-y: scroll;
    }

    .info {
        flex: 2;
    }

    .list-item {
        padding: 15px 30px;
        height: 60px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f0f0f0;
    }

    .button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        color: black;
        font-weight: normal;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Roboto", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        text-align: left;
        z-index: ${parseInt(config.zIndex) || 99999};
    }

    .top-section {
        padding: 15px 30px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1px solid #f0f0f0;
    }

    .beta-list-cancel {
        cursor: pointer;
    }

    .title {
        font-size: 20px;
        font-weight: bold;
    }

    .popup {
        position: fixed;
        top: 50%;
        left: 50%;
        color: black;
        transform: translate(-50%, -50%);
        font-weight: normal;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Roboto", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        text-align: left;
        z-index: ${parseInt(config.zIndex) || 99999};

        display: none;
        flex-direction: column;
        background: white;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        padding-top: 5px;
        width: 50%;
        height: 50%;
        box-shadow: -6px 0 16px -8px rgb(0 0 0 / 8%), -9px 0 28px 0 rgb(0 0 0 / 5%), -12px 0 48px 16px rgb(0 0 0 / 3%);
    }

    .button {
        width: 64px;
        height: 64px;
        border-radius: 100%;
        text-align: center;
        line-height: 60px;
        font-size: 32px;
        border: none;
        cursor: pointer;
    }
    .button:hover {
        filter: brightness(1.2);
    }

    .empty-prompt {
        flex: 1;
        text-align: center;
        margin-top: 20px;
    }



    /* The switch - the box around the slider */
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
    }

    /* Hide default HTML checkbox */
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    /* The slider */
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: .4s;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 27px;
        width: 27px;
        left: -1px;
        bottom: -1px;
        background-color: gray;
        -webkit-transition: .4s;
        transition: .4s;
    }

    input:checked + .slider {
        background-color: #2196F3;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #2196F3;
    }

    input:checked + .slider:before {
        -webkit-transform: translateX(26px);
        -ms-transform: translateX(26px);
        transform: translateX(26px);
    }

    /* Rounded sliders */
    .slider.round {
        border-radius: 20px;
    }

    .slider.round:before {
        border-radius: 50%;
    }
`

interface PreviewItem {
    name: string
    description: string
    feature_flag_key: string
}

const exampleFeatures: PreviewItem[] = [
    {
        name: 'Funnel Analysis',
        description: 'Analyze user engagement and conversion throughout a user journey.',
        feature_flag_key: 'funnel-180'
    },
    {
        name: 'Cohort Analysis',
        description: 'Group users by common characteristics and analyze user behavior over time.',
        feature_flag_key: 'cohorts-180'
    }
]



export function inject({ config, posthog }) {
    if (config.domains) {
        const domains = config.domains.split(',').map((domain) => domain.trim())
        if (domains.length > 0 && domains.indexOf(window.location.hostname) === -1) {
            return
        }
    }
    const shadow = createShadow(style(config))

    function optIn(feature_flag_key: string) {
        posthog.updateFeaturePreviewEnrollment(feature_flag_key, true)
    }

    function optOut(feature_flag_key: string) {
        posthog.updateFeaturePreviewEnrollment(feature_flag_key, false)
    }

    function openbugBox() {
        Object.assign(listElement.style, { display: 'flex' })

        const closeButton = shadow.querySelector('.beta-list-cancel')
        closeButton?.addEventListener('click', (e) => {
            e.preventDefault()
            Object.assign(listElement.style, { display: 'none' })
        })

        previewItemData.forEach((item, index) => {
            const checkbox = shadow.querySelector('.checkbox-' + index)
            checkbox?.addEventListener('click', (e) => {
                console.log(index, e.target?.checked)
                if (e.target?.checked) {
                    optIn(item.feature_flag_key)
                } else {
                    optOut(item.feature_flag_key)
                }
            })
        })

        // // Hide when clicked outside
        // const _betaList = document.getElementById('beta-list')
        // document.addEventListener('click', function(event) {
        //     const isClickInside = _betaList?.contains(event.target)

        //     if (!isClickInside) {
        //         // Object.assign(formElement.style, { display: 'none' })
        //     }
        // });
    }

    // TODO: Make this button a config option
    const buttonElement = Object.assign(document.createElement('button'), {
        className: 'button',
        innerText: config.buttonText || '?',
        onclick: openbugBox,
        title: config.buttonTitle || '',
    })
    Object.assign(buttonElement.style, {
        color: config.buttonColor || 'black',
        background: config.buttonBackground || '#1d8db9',
    })

    shadow.appendChild(buttonElement)

    const previewItemData = exampleFeatures
    const previewItems = listItemComponents(previewItemData)
    const previewList = previewItems ? `
        <div class="list">
            ${previewItems}
        </div>
    ` : `
        <div class="empty-prompt">
            No beta features opt into
        </div>
    `

    const CloseButtonComponent = (width, height) => `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
    `

    const BetaListComponent = `
        <div class='top-section'>
            <div class='title'>Beta Management</div>
            <div class='beta-list-cancel'>
                ${CloseButtonComponent(30, 30)}
            </div>
        </div>
        <div class="list-container">
            ${previewList}
        </div>
    `

    const betaListElement = document.createElement('div')
    betaListElement.id = 'beta-list'
    const listElement = Object.assign(betaListElement, {
        className: 'popup',
        innerHTML: BetaListComponent
    })

    shadow.appendChild(listElement)

    if (config.selector) {
        const clickListener = (e) => {
            if (e.target.matches(config.selector)) {
                openbugBox()
            }
        }
        window.addEventListener('click', clickListener)
    }

}

const listItemComponents = (items: PreviewItem[]) => items.map((item, index) =>  `
        <div class='list-item' data-name='${item.name}'>
            <div>
                <b class='list-item-name'>${item.name}</b>
                <div class='list-item-description'>${item.description}</div>
            </div>
            <label class="switch">
                <input class='checkbox-${index}' type="checkbox">
                <span class="slider round"></span>
            </label>
        </div>
    `
).join('')

function createShadow(style?: string): ShadowRoot {
  const div = document.createElement('div')
  const shadow = div.attachShadow({ mode: 'open' })
  if (style) {
    const styleElement = Object.assign(document.createElement('style'), {
      innerText: style,
    })
    shadow.appendChild(styleElement)
  }
  document.body.appendChild(div)
  return shadow
}
