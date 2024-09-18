/* eslint-disable react/style-prop-object */
import "./input.css"
import "./App.css";
import {
  ActionButton,
  Provider,
  defaultTheme,
} from '@adobe/react-spectrum';
import Moon from "@spectrum-icons/workflow/Moon";
import Light from "@spectrum-icons/workflow/Light"
import { useReducer, useState } from "react";
import * as Actions from "./state/actions";
import { DEFAULT_PREFERRED_LANGUAGE } from "./state/const";
import WritePage from "./pages/write";
import { ReaderPage } from "./pages/reader";


function appStateReducer(state, action) {
  switch (action.type) {

    // Change application mode
    case Actions.MODE_READ: {
      state.mode = Actions.MODE_READ;
      state.phrasal_verbs = action.phrasal_verbs;
      break;
    }
    case Actions.MODE_WRITE: {
      state.mode = Actions.MODE_WRITE;

      break;
    }

    // Change one of languages
    case Actions.CHANGE_PRIMARY_LANG: {
      if (state.source_language === action.language) {
        state.source_language = state.preferred_language;
      }
      state.preferred_language = action.language;
      state.translations = [];
      break;
    }

    // Editor data changed
    case Actions.EDITOR_DATA_CHANGED: {
      state.source_data = action.data;
      break;
    }

    // Reader
    case Actions.READER_NEW_TRANSLATION: {
      if (action.isMulty) {
        state.translation.multi.push(action.translation)
      } else {
        state.translations.single.push(action.translation);
      }

      break;
    }

    default: {
      console.error("App state: Incorrect action type!");
      break;
    }
  }

  return { ...state };
}

function App() {

  const [appState, dispatchAppState] = useReducer(appStateReducer, {
    mode: Actions.MODE_WRITE,
    preferred_language: DEFAULT_PREFERRED_LANGUAGE,
    source_data: "",
    phrasal_verbs: [],
  });

  const [theme, setTheme] = useState("dark");

  function changeTheme() {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  function isReadMode() {
    return appState.mode === Actions.MODE_READ;
  }

  function isWriteMode() {
    return !isReadMode();
  }

  function switchModeWrite() {
    dispatchAppState({ type: Actions.MODE_WRITE });
  }

  function switchModeRead(phrasal_verbs) {
    dispatchAppState({ type: Actions.MODE_READ, phrasal_verbs });
  }

  function changePreferedLanguage(language) {
    dispatchAppState({ type: Actions.CHANGE_PRIMARY_LANG, language });
  }

  function onEditorDataChange(data) {
    dispatchAppState({ type: Actions.EDITOR_DATA_CHANGED, data });
  }


  return (
    <Provider theme={defaultTheme} colorScheme={theme} height="100%" width="100%">
      <ActionButton
        onPress={changeTheme}
        position="absolute"
        top="size-100"
        right="size-100"
      >
        {
          (theme === "dark") ? <Light></Light> : <Moon></Moon>
        }
      </ActionButton>
      {
        isWriteMode() &&
        <WritePage
          source_language={appState.source_language}
          preferred_language={appState.preferred_language}
          initial_data={appState.source_data}
          onLanguageChange={changePreferedLanguage}
          onEditorDataChange={onEditorDataChange}
          onViewModeClick={switchModeRead}
        />
      }
      {
        isReadMode() &&
        <ReaderPage
          text={appState.source_data}
          phrases={appState.phrasal_verbs}
          preferred_language={appState.preferred_language}
          onLanguageChange={changePreferedLanguage}
          onEditorMode={switchModeWrite}
        />
      }
    </Provider>
  );
}

export default App;
