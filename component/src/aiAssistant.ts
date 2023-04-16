import {CustomMessageStyles, ErrorMessages, IntroMessage, MessageContent, OnNewMessage} from './types/messages';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils';
import {FocusUtils} from './views/chat/input/keyboardInput/focusUtils';
import {InternalHTML} from './utils/webComponent/internalHTML';
import {InsertKeyView} from './views/insertKey/insertKeyView';
import {RequestInterceptor} from './types/requestInterceptor';
import {ServiceIOFactory} from './services/serviceIOFactory';
import {CustomServiceConfig} from './types/customService';
import {RequestSettings} from './types/requestSettings';
import {SubmitButtonStyles} from './types/submitButton';
import {Property} from './utils/decorators/property';
import {SpeechInput} from './types/speechInput';
import {ChatView} from './views/chat/chatView';
import style from './AiAssistant.css?inline';
import {CustomStyle} from './types/styles';
import {InputStyles} from './types/input';
import {Avatars} from './types/avatar';
import {OpenAI} from './types/openAI';
import {Names} from './types/names';

// WORK - change visibility icons to scalable
// WORK - handle images
// WORK - the loading icon position adjust
// WORK - insert starter content through a slot
export class AiAssistant extends InternalHTML {
  @Property('string')
  apiKey?: string;

  @Property('object')
  openAI?: OpenAI;

  @Property('object')
  customService?: CustomServiceConfig;

  @Property('boolean')
  startWithChatView?: boolean;

  @Property('object')
  requestSettings?: RequestSettings;

  // WORK - need to automatically adjust position when items are inserted in different positions
  @Property('boolean')
  speechInput?: SpeechInput;

  @Property('boolean')
  speechOutput?: boolean;

  @Property('object')
  containerStyle?: CustomStyle;

  @Property('object')
  inputStyles?: InputStyles;

  @Property('number')
  inputCharacterLimit?: number;

  @Property('object')
  submitButtonStyles?: SubmitButtonStyles;

  @Property('object')
  messageStyles?: CustomMessageStyles;

  @Property('object')
  avatars?: Avatars;

  @Property('object')
  names?: Names;

  @Property('object')
  initialMessages?: MessageContent[];

  @Property('string')
  introMessage?: IntroMessage;

  @Property('boolean')
  displayLoadingMessage?: boolean;

  @Property('object')
  errorMessage?: ErrorMessages;

  @Property('string')
  context?: string;

  @Property('function')
  requestInterceptor?: RequestInterceptor;

  @Property('function')
  onNewMessage?: OnNewMessage;

  @Property('string')
  auxiliaryStyle?: string;

  focusInput: () => void = () => {
    if (ChatView.shouldBeRendered(this)) FocusUtils.focusFromParentElement(this._elementRef);
  };

  getMessages: () => MessageContent[] = () => [];

  submitUserMessage: (text: string) => void = () =>
    console.warn('submitUserMessage failed - please wait for chat view to render before calling this property.');

  _hasBeenRendered = false;

  _auxiliaryStyleApplied = false;

  // TO-DO - key view style

  constructor() {
    super();
    this._elementRef = document.createElement('div');
    this._elementRef.id = 'container';
    this.attachShadow({mode: 'open'}).appendChild(this._elementRef);
    WebComponentStyleUtils.apply(style, this.shadowRoot);
    setTimeout(() => {
      // if user has not set anything (to cause onRender to execute), force it
      if (!this._hasBeenRendered) this.onRender();
    }, 20); // rendering takes time, hence this is a high value to be safe
  }

  private readonly _elementRef: HTMLElement;

  private changeToChatView(newKey: string) {
    this.apiKey = newKey;
    this.onRender();
  }

  override onRender() {
    // TO-DO this will be moved to service selection view
    const serviceIO = ServiceIOFactory.create(this, this.apiKey || '');
    if (this.auxiliaryStyle && !this._auxiliaryStyleApplied) {
      WebComponentStyleUtils.apply(this.auxiliaryStyle, this.shadowRoot);
      this._auxiliaryStyleApplied = true;
    }
    Object.assign(this._elementRef.style, this.containerStyle);
    if (ChatView.shouldBeRendered(this)) {
      ChatView.render(this, this._elementRef, serviceIO);
    } else {
      // the reason why this is not initiated in the constructor is because properties/attributes are not available
      // when it is executed, meaning that if the user sets startWithChatView or apiKey to true, this would first
      // appear and then then the chatview would be rendered after it, which causes a blink and is bad UX
      InsertKeyView.render(this._elementRef, this.changeToChatView.bind(this), serviceIO);
    }
    this._hasBeenRendered = true;
  }
}

customElements.define('ai-assistant', AiAssistant);

// The following type makes it easier for other projects to use this component with TypeScript
declare global {
  interface HTMLElementTagNameMap {
    'ai-assistant': AiAssistant;
  }
}