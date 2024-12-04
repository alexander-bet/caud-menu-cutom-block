import { useState } from '@wordpress/element';
import { SlotFillProvider, ToolbarGroup, ToolbarButton, Popover } from '@wordpress/components';
import { BlockEditorProvider, BlockTools, WritingFlow, ObserveTyping, BlockList, Inserter } from '@wordpress/block-editor';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import '@wordpress/block-library';
import '@wordpress/format-library';

// Register core/paragraph
registerBlockType('core/paragraph', {
   title: __('Paragraph'),
   icon: 'editor-paragraph',
   category: 'common',
   attributes: {
      content: {
         type: 'string',
         source: 'html',
         selector: 'p',
      },
   },
   edit({ attributes, setAttributes }) {
      return (
         <p>
            <textarea
               value={attributes.content}
               onChange={(event) => setAttributes({ content: event.target.value })}
            />
         </p>
      );
   },
   save({ attributes }) {
      return <p className="wp-block-paragraph">{attributes.content}</p>;
   },
});

// Register core/columns
registerBlockType('core/columns', {
   title: __('Columns'),
   icon: 'columns',
   category: 'layout',
   attributes: {
      columns: {
         type: 'number',
         default: 2,
      },
   },
   edit({ attributes, setAttributes }) {
      return (
         <div className="wp-block-columns">
            {[...Array(attributes.columns)].map((_, index) => (
               <div key={index} className="wp-block-column">
                  <textarea
                     placeholder={`Column ${index + 1}`}
                     onChange={(event) => setAttributes({ [`column${index + 1}`]: event.target.value })}
                  />
               </div>
            ))}
         </div>
      );
   },
   save({ attributes }) {
      return (
         <div className="wp-block-columns">
            {[...Array(attributes.columns)].map((_, index) => (
               <div key={index} className="wp-block-column">
                  {attributes[`column${index + 1}`]}
               </div>
            ))}
         </div>
      );
   },
});

// Register core/image
registerBlockType('core/image', {
   title: __('Image'),
   icon: 'format-image',
   category: 'media',
   attributes: {
      url: {
         type: 'string',
         source: 'attribute',
         selector: 'img',
         attribute: 'src',
      },
      alt: {
         type: 'string',
         source: 'attribute',
         selector: 'img',
         attribute: 'alt',
         default: '',
      },
   },
   edit({ attributes, setAttributes }) {
      return (
         <div className="wp-block-image">
            <input
               type="text"
               placeholder="Image URL"
               value={attributes.url}
               onChange={(event) => setAttributes({ url: event.target.value })}
            />
            <input
               type="text"
               placeholder="Alt text"
               value={attributes.alt}
               onChange={(event) => setAttributes({ alt: event.target.value })}
            />
         </div>
      );
   },
   save({ attributes }) {
      return <img src={attributes.url} alt={attributes.alt} className="wp-block-image" />;
   },
});

const initialContent = '<!-- wp:paragraph --><p class="wp-block-paragraph">Example paragraph content</p><!-- /wp:paragraph -->';

const Editor = ({ content = initialContent, onChange }) => {
   let blocks = [];
   try {
      console.log('Parsing content:', content);
      blocks = wp.blocks.parse(content);
      console.log('Parsed blocks:', blocks); и
      if (!Array.isArray(blocks)) {
         throw new Error('Parsed content is not an array');
      }
   } catch (error) {
      console.error('Error parsing content:', error);
      blocks = [];
   }

   const [blockState, updateBlocks] = useState(blocks);

   return (
      <SlotFillProvider>
         <BlockEditorProvider
            value={blockState}
            onInput={updateBlocks}
            onChange={(newBlocks) => {
               updateBlocks(newBlocks);
               onChange(wp.blocks.serialize(newBlocks));
            }}
         >
            <BlockTools>
               <ToolbarGroup>
                  <ToolbarButton icon="edit" label={__('Edit')} />
                  <ToolbarButton icon="trash" label={__('Delete')} />
               </ToolbarGroup>
               <Inserter
                  rootClientId={null}
                  isAppender
                  renderToggle={({ onToggle, isOpen }) => (
                     <ToolbarButton
                        icon="plus"
                        label={__('Add block')}
                        onClick={onToggle}
                        isPressed={isOpen}
                     />
                  )}
               />
               <WritingFlow>
                  <ObserveTyping>
                     <BlockList />
                  </ObserveTyping>
               </WritingFlow>
            </BlockTools>
            <Popover.Slot />
         </BlockEditorProvider>
      </SlotFillProvider>
   );
};

domReady(() => {
   const textareas = document.querySelectorAll('.edit-menu-item-custom');
   textareas.forEach(textarea => {
      const id = textarea.id;
      const content = textarea.value || initialContent;
      console.log('Textarea content:', content);
      const editorContainerId = `editor-container-${id.split('-').pop()}`;

      const container = document.getElementById(editorContainerId);
      if (container) {
         console.log('Rendering editor in container:', editorContainerId);
         wp.element.render(<Editor content={content} onChange={(newContent) => { textarea.value = newContent; }} />, container);
      } else {
         console.error('Container not found for ID:', editorContainerId);
      }
   });
});