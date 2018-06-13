import React, { Component } from 'react';
import Bridge from '../services/bridge';
import ImageUploader from 'react-images-upload';
import Form from 'react-jsonschema-form'
import Dropzone from 'react-dropzone'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class CreateListing extends Component {
    constructor() {
        super();

        this.state = {
            listing: {},
            listingData: {},
            pictures: [],
            preview: [],
            formListing: {formData: null},
            isOpen: false
        }

        this.onListingSubmit = this.onListingSubmit.bind(this);
        this.onDrop = this.onDrop.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    async componentDidMount() {
        var listingIds = await Bridge.contractService.getAllListingIds();
        this.setState({listingIds});
    }

    onDrop(acceptedFiles) {
        let {preview, pictures} = this.state;

        acceptedFiles.forEach(file => {
            const reader = new FileReader();
            preview.push(file.preview);
            reader.onload = () => {
                const fileAsBinaryString = reader.result;
                const data = btoa(fileAsBinaryString);
                pictures.push("data:image/png;base64," + data);
            };
            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
    
            reader.readAsBinaryString(file);
        });

        this.setState({preview, pictures});
    }

    async onListingSubmit(object) {
        object.formData.pictures = this.state.pictures;
        this.setState({
            formListing: object
        });
        const tx = await Bridge.listings.create(object.formData);

        if (tx.status) {
            this.setState({isOpen: true});
        }
    }

    onChange(object) {
        this.setState({
            formListing: object
        });
    }

    render() {
        const { listingIds, pictures, preview } = this.state;
        const schema = {
            title: "LISTING INFORMATION",
            type: "object",
            properties: {
                name: {type: "string", title: "Name"},
              category: {type: "string", title: "Category"},
              description: {type: "string", title: "Description"},
              location: {type: "string", title: "Location"},
              price: {type: "number", title: "Price"}
            }
          };

        const uiSchema = {
            name: {
                classNames: "name"
            },
            category: {
                classNames: "category"
            },
            description: {
                "ui:widget": "textarea",
                "ui:options": {
                    rows: 5
                }
            }
          }
          
        return (
            <div>
                <Form
                  schema={schema}
                  uiSchema={uiSchema}
                  formData={this.state.formListing.formData}
                  onChange={this.onChange}
                  onSubmit={this.onListingSubmit}
                >
                    <p>Images</p>
                  <Dropzone className="dropzone" onDrop={this.onDrop}>
                    <p>Try dropping some files here, or click to select files to upload.</p>
                    <div className="preview">
                        {preview.map(picture => <img src={picture}/>)}
                    </div>
                  </Dropzone>
                    <button type="submit" className="float-center btn btn-secondary">Continue</button>
                </Form>

                <Modal isOpen={this.state.isOpen} toggle={this.toggle} className={this.props.className}>
                    <ModalBody>
                    Creating listing successfully
                    </ModalBody>
                    <ModalFooter>
                        <a href="/">Home</a>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default CreateListing;