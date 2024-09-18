
import {
    Flex,
    View,
    ComboBox,
    Item,
    ActionButton,
    Text
} from '@adobe/react-spectrum';
import Book from "@spectrum-icons/workflow/Book";
import EditorComponent from "../../components/editor";
import { LANGUAGE_LIST } from "../../state/const";
import { invoke } from '@tauri-apps/api';
import { normalizeText } from '../../helpers';


function WritePage({
    preferred_language,
    initial_data,
    onLanguageChange,
    onEditorDataChange,
    onViewModeClick
}) {

    let editorData = initial_data;

    function onNewInput(data) {
        data = normalizeText(data);
        editorData = data;
        onEditorDataChange(data);
    }

    function onReadingModeCall() {
        invoke(
            "parse_text",
            { text: editorData }
        ).then((pv) => {
            console.log("Call 'parse_text' with: ", { text: editorData });

            onViewModeClick(pv);
        }).catch(console.error);
    }

    return (
        <Flex direction="column" width="100%" height="100%">
            <View width="100%" paddingY="size-115">
                <Flex direction="row" justifyContent="center" alignItems="flex-end" gap="size-300">
                    <ComboBox
                        label="Primary language"
                        selectedKey={preferred_language}
                        onSelectionChange={onLanguageChange}
                        necessityIndicator="icon"
                        isRequired
                    >
                        {LANGUAGE_LIST.map((lng) => <Item key={lng}>{lng}</Item>)}
                    </ComboBox>
                    <ActionButton onPressChange={onReadingModeCall}>
                        <Book />
                        <Text>Go Reading</Text>
                    </ActionButton>
                </Flex>
            </View>
            <View flex>
                <EditorComponent onInputTextChanged={onNewInput} initial_data={editorData} />
            </View>
        </Flex>
    )
}

export default WritePage;