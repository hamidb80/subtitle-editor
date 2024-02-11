import React, { ChangeEvent, createRef, RefObject } from 'react'
import './file-input.sass'


class FileInput extends React.Component<{
	onChange?: (f: File) => void
	filename: string
}, {}> {

	fileInput: RefObject<HTMLInputElement>

	constructor(props: any) {
		super(props)

		this.fileInput = createRef()

		this.changeHandler = this.changeHandler.bind(this)
		this.redirectToInput = this.redirectToInput.bind(this)
	}

	changeHandler(e: ChangeEvent<HTMLInputElement>) {
		const inputFileElem = e.target

		// send selected file to it
		if (this.props.onChange && inputFileElem.files?.length) {
			const file = inputFileElem.files[0]
			this.props.onChange(file)
		}
	}

	redirectToInput() {
		this.fileInput.current?.click()
	}

	render() {
		const
			filename = this.props.filename,
			placeHolder = filename ? `[${filename}] click to rechoose` : 'choose a file'

		return (
			<div className="form-group file-input-wrapper">
				<input type="file" ref={this.fileInput} className="d-none"
					onChange={this.changeHandler} />

				<button
					className="rounded font-weight-bold btn btn-info w-100 virtual-file-input"
					onClick={_ => this.redirectToInput()}>
					<span> {placeHolder} </span>
				</button>

			</div>
		)
	}
}

export default FileInput