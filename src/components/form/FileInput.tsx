import React, { ChangeEvent, createRef, RefObject } from 'react'
import '../../styles/components/file-input.sass'

type Props = {
    onChange?: (f: File) => void
}

class FileInput extends React.Component<Props> {
    state: {
        filename: string
    }
    fileInput: RefObject<HTMLInputElement>

    constructor(props: any) {
        super(props)

        this.state = {
            filename: ''
        }

        this.fileInput = createRef()

        this.changeHandler = this.changeHandler.bind(this)
        this.redirectToInput = this.redirectToInput.bind(this)
    }

    changeHandler(e: ChangeEvent<HTMLInputElement>) {
        const inputFileElem = e.target

        // send selected file to it
        if (this.props.onChange && inputFileElem.files?.length){
            const file = inputFileElem.files[0]
            this.props.onChange(file)
            
            this.setState({
                filename: file.name
            })
        }
    }

    redirectToInput() {
        this.fileInput.current?.click()
    }

    render() {
        const filename = this.state.filename
        const placeHolder = filename ? `[${filename}] click to rechoose` : 'choose a file'

        return (
            <div className="form-group file-input-wrapper">
                <input type="file" ref={this.fileInput} className="d-none"
                    onChange={this.changeHandler} />

                <button
                    className="rounded font-weight-bold btn btn-info w-100 virtual-file-input"
                    onClick={e => this.redirectToInput()}>
                    <span> {placeHolder} </span>
                </button>

            </div>
        )
    }
}

export default FileInput