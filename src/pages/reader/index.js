import {
    Flex,
    View,
    ComboBox,
    Item,
    ActionButton,
    Text
} from '@adobe/react-spectrum';
import { LANGUAGE_LIST } from "../../state/const";
import Draw from "@spectrum-icons/workflow/Draw";
import { ReaderComponent } from '../../components/reader';

export function ReaderPage({ text, phrases, preferred_language, onLanguageChange, onEditorMode }) {

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
                    <ActionButton onPressChange={onEditorMode}>
                        <Draw />
                        <Text>Edit Text</Text>
                    </ActionButton>
                </Flex>
            </View>
            <View flex padding="size-65">
                <ReaderComponent text={text} phrases={phrases} language={preferred_language} />
            </View>
        </Flex>
    )
}