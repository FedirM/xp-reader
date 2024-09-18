import { TextArea } from '@adobe/react-spectrum'

function EditorComponent({ onInputTextChanged, initial_data }) {

    return (
        <TextArea
            value={initial_data}
            onChange={onInputTextChanged}
            width="100%"
            height="100%"
        />
    )
}

export default EditorComponent;