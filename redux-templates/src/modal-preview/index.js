const {compose} = wp.compose;
const {withDispatch, withSelect} = wp.data;
const {useState, useEffect, useReducer} = wp.element
import SitePreviewSidebar from './SitePreviewSidebar';
import {ModalManager} from '../modal-manager'
import ImportWizard from '../modal-import-wizard';
import {Fragment} from 'react';
import SafeImageLoad from '~redux-templates/components/safe-image-load';
import {processImportHelper} from '~redux-templates/stores/actionHelper';
import './style.scss';

const initialState = {
    currentPageData: null,
    currentIndex: 0,
    itemData: null,
    imageURL: ''
};

const previewReducer = (state, action) => {
    let itemData;
    let imageURL;
    switch(action.type) {
        case 'INDEX':
            itemData = state.currentPageData[action.currentIndex];
            if (itemData.image_full)
                imageURL = itemData.image_full;
            else 
                imageURL = itemData.image
        
            return {
                ...state,
                currentIndex: action.currentIndex,
                imageURL,
                itemData
            };
        case 'DATA':
            itemData = action.currentPageData[action.currentIndex];
            if (itemData.image_full)
                imageURL = itemData.image_full;
            else 
                imageURL = itemData.image
            return {
                currentPageData: action.currentPageData,
                currentIndex: action.currentIndex,
                imageURL,
                itemData
            };
    }
}

function PreviewModal(props) {

    const {startIndex, currentPageData} = props;
    const {setImportingTemplate, importingTemplate} = props;
    
    const [state, dispatch] = useReducer(previewReducer, initialState);

    const [previewClass, setPreviewClass] = useState('preview-desktop')
    const [expandedClass, toggleExpanded] = useState('expanded')
    const [pressedKey, setPressedKey] = useState(null);
    const [overlayClassname, setOverlayClassname] = useState('wp-full-overlay-main');
    const [wrapperClassName, setWrapperClassName] = useState('wp-full-overlay sites-preview theme-install-overlay ');

    // Key event handling : event listener set up
    useEffect(() => {
        const handleKeyDown = ({keyCode}) => {
            setPressedKey(keyCode);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    // Key Event handling
    useEffect(() => {
        if (pressedKey !== null) {
            if (pressedKey === 37) onPrevBlock();
            if (pressedKey === 39) onNextBlock();
            setPressedKey(null);
        }
    }, [pressedKey])

    useEffect(() => {
        if (isNaN(startIndex) === false && currentPageData)
            dispatch({ type: 'DATA', currentIndex: startIndex, currentPageData });
    }, [startIndex, currentPageData]);

    // mobile/desktop preview status and sidebar collapse/expand
    useEffect(() => {
        setWrapperClassName(['wp-full-overlay sites-preview theme-install-overlay ', previewClass, expandedClass].join(' '));   
    }, [previewClass, expandedClass])

    const onCloseCustomizer = () => {
        ModalManager.closeCustomizer();
    }

    const onNextBlock = () => {
        if (state.currentIndex < currentPageData.length - 1) {
            setOverlayClassname('wp-full-overlay-main');
            setTimeout(() => {
                dispatch({ type: 'INDEX', currentIndex: state.currentIndex + 1 });
            }, 0)
        }
    }

    const onPrevBlock = () => {
        if (state.currentIndex > 0) {
            setOverlayClassname('wp-full-overlay-main');
            setTimeout(() => {
                dispatch({ type: 'INDEX', currentIndex: state.currentIndex - 1 });
            }, 0)

        }
    }


    const importStarterBlock = () => {
        setImportingTemplate(state.itemData);
        ModalManager.closeCustomizer();
    }

    const processImport = () => {
        if (importingTemplate) processImportHelper();
    }

    // Called from iframe upon successful loading
    const hideSpinner = () => {
        setOverlayClassname('wp-full-overlay-main loaded');
    }

    if (!state || !state.itemData) return null;

    return (
        <Fragment>
            <div className={wrapperClassName} style={{display: 'block'}}>
                <SitePreviewSidebar itemData={state.itemData} previewClass={previewClass} expandedClass={expandedClass}
                                    onNextBlock={onNextBlock} onPrevBlock={onPrevBlock}
                                    onCloseCustomizer={onCloseCustomizer} onToggleExpanded={e => toggleExpanded(e)}
                                    onImport={importStarterBlock}
                                    onChangePreviewClass={e => setPreviewClass(e)}/>
                <div className={overlayClassname}>
                    {state.itemData.url &&
                        <iframe src={state.itemData.url} target='Preview' onLoad={hideSpinner}></iframe>
                    }
                    {!state.itemData.url &&
                        <div className='redux-templates-modal-preview-box'>
                            <SafeImageLoad url={state.imageURL} />
                        </div>
                    }

                </div>
            </div>
            { importingTemplate && <ImportWizard startImportTemplate={processImport} /> }
        </Fragment>
    );
}

export default compose([
    withDispatch((dispatch) => {
        const {
            setImportingTemplate,
            setCustomizerOpened
        } = dispatch('redux-templates/sectionslist');

        return {
            setImportingTemplate,
            setCustomizerOpened
        };
    }),

    withSelect((select, props) => {
        const {getImportingTemplate} = select('redux-templates/sectionslist');
        return {
            importingTemplate: getImportingTemplate()
        };
    })
])(PreviewModal);
