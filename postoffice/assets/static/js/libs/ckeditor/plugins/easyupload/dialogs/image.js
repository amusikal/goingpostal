/*
easy Image dialog
*/

(function()
{
	// Load image preview.
	var IMAGE = 1,
		LINK = 2,
		PREVIEW = 4,
		CLEANUP = 8,
		regexGetSize = /^\s*(\d+)((px)|\%)?\s*$/i,
		regexGetSizeOrEmpty = /(^\s*(\d+)((px)|\%)?\s*$)|^$/i;

	var imageDialog = function( editor, dialogType )
	{

		var numbering = function( id )
			{
				return CKEDITOR.tools.getNextId() + '_' + id;
			},
			btnLockSizesId = numbering( 'btnLockSizes' ),
			btnResetSizeId = numbering( 'btnResetSize' ),
			imagePreviewLoaderId = numbering( 'ImagePreviewLoader' ),
			previewImageId = numbering( 'previewImage' );

	var onSizeChange = function()
	{
		var value = this.getValue(),	// This = input element.
			dialog = this.getDialog(),
			aMatch  =  value.match( regexGetSize );	// Check value
		if ( aMatch )
		{
			if ( aMatch[2] == '%' )			// % is allowed - > unlock ratio.
				switchLockRatio( dialog, false );	// Unlock.
			value = aMatch[1];
		}

		// Only if ratio is locked
		if ( dialog.lockRatio )
		{
			var oImageOriginal = dialog.originalElement;
			if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' )
			{
				if ( this.id == 'txtHeight' )
				{
					if ( value && value != '0' )
						value = Math.round( oImageOriginal.$.width * ( value  / oImageOriginal.$.height ) );
					if ( !isNaN( value ) )
						dialog.setValueOf( 'info', 'txtWidth', value );
				}
				else		//this.id = txtWidth.
				{
					if ( value && value != '0' )
						value = Math.round( oImageOriginal.$.height * ( value  / oImageOriginal.$.width ) );
					if ( !isNaN( value ) )
						dialog.setValueOf( 'info', 'txtHeight', value );
				}
			}
		}
		updatePreview( dialog );
	};

	var updatePreview = function( dialog )
	{
		//Don't load before onShow.
		if ( !dialog.originalElement || !dialog.preview )
			return 1;

		// Read attributes and update imagePreview;
		dialog.commitContent( PREVIEW, dialog.preview );
		return 0;
	};

	var switchLockRatio = function( dialog, value )
	{
		var oImageOriginal = dialog.originalElement,
			ratioButton = CKEDITOR.document.getById( btnLockSizesId );

		if (!ratioButton)
		{
			dialog.lockRatio = true ;
			return true;
		}

		if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' )
		{
			if ( value == 'check' )			// Check image ratio and original image ratio.
			{
				var width = dialog.getValueOf( 'info', 'txtWidth' ),
					height = dialog.getValueOf( 'info', 'txtHeight' ),
					originalRatio = oImageOriginal.$.width * 1000 / oImageOriginal.$.height,
					thisRatio = width * 1000 / height;
				dialog.lockRatio  = false;		// Default: unlock ratio

				if ( !width && !height )
					dialog.lockRatio = true;
				else if ( !isNaN( originalRatio ) && !isNaN( thisRatio ) )
				{
					if ( Math.round( originalRatio ) == Math.round( thisRatio ) )
						dialog.lockRatio = true;
				}
			}
			else if ( value != undefined )
				dialog.lockRatio = value;
			else
				dialog.lockRatio = !dialog.lockRatio;
		}
		else if ( value != 'check' )		// I can't lock ratio if ratio is unknown.
			dialog.lockRatio = false;

		if ( dialog.lockRatio )
			ratioButton.removeClass( 'cke_btn_unlocked' );
		else
			ratioButton.addClass( 'cke_btn_unlocked' );

		return dialog.lockRatio;
	};

	var resetSize = function( dialog )
	{
		var oImageOriginal = dialog.originalElement;
		if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' )
		{
			dialog.setValueOf( 'info', 'txtWidth', oImageOriginal.$.width );
			dialog.setValueOf( 'info', 'txtHeight', oImageOriginal.$.height );
		}
		updatePreview( dialog );
	};

	var setupDimension = function( type, element )
	{
		if ( type != IMAGE )
			return;

		function checkDimension( size, defaultValue )
		{
			var aMatch  =  size.match( regexGetSize );
			if ( aMatch )
			{
				if ( aMatch[2] == '%' )				// % is allowed.
				{
					aMatch[1] += '%';
					switchLockRatio( dialog, false );	// Unlock ratio
				}
				return aMatch[1];
			}
			return defaultValue;
		}

		var dialog = this.getDialog(),
			value = '',
			dimension = (( this.id == 'txtWidth' )? 'width' : 'height' ),
			size = element.getAttribute( dimension );

		if ( size )
			value = checkDimension( size, value );
		value = checkDimension( element.$.style[ dimension ], value );

		this.setValue( value );
	};

		// copy fileBrowser configuration items.
		editor.config.filebrowserEasyImageBrowseUrl = editor.config.filebrowserImageBrowseUrl || editor.config.filebrowserBrowseUrl;
		editor.config.filebrowserEasyImageUploadUrl = editor.config.filebrowserImageUploadUrl || editor.config.filebrowserUploadUrl;

		var onImgLoadEvent = function()
		{
			// Image is ready.
			var original = this.originalElement;
			original.setCustomData( 'isReady', 'true' );
			original.removeListener( 'load', onImgLoadEvent );
			original.removeListener( 'error', onImgLoadErrorEvent );
			original.removeListener( 'abort', onImgLoadErrorEvent );

			// Hide loader
			var loader = CKEDITOR.document.getById( imagePreviewLoaderId ) ;
			if (loader)
				loader.setStyle( 'display', 'none' );

			// New image -> new dimensions
			if ( !this.dontResetSize )
				resetSize( this );

			if ( this.firstLoad )
				switchLockRatio( this, 'check' );
			this.firstLoad = false;
			this.dontResetSize = false;
		};

		var onImgLoadErrorEvent = function()
		{
			// Error. Image is not loaded.
			var original = this.originalElement;
			original.removeListener( 'load', onImgLoadEvent );
			original.removeListener( 'error', onImgLoadErrorEvent );
			original.removeListener( 'abort', onImgLoadErrorEvent );

			// Set Error image.
			var noimage = CKEDITOR.getUrl( editor.skinPath + 'images/noimage.png' );

			if ( this.preview )
				this.preview.setAttribute( 'src', noimage );

			// Hide loader
			var loader = CKEDITOR.document.getById( imagePreviewLoaderId );
			if (loader) loader.setStyle( 'display', 'none' );
			switchLockRatio( this, false );	// Unlock.
		};

		var styles={};
		return {
			title : ( dialogType == 'image' ) ? editor.lang.image.title : editor.lang.image.titleButton,
			minWidth : 600,
			minHeight : 480,
			onShow : function()
			{
				this.imageElement = false;

				// Default: create a new element.
				this.imageEditMode = false;

				this.lockRatio = true;
				this.dontResetSize = false;
				this.firstLoad = true;

				//Hide loader.
				var loader = CKEDITOR.document.getById( imagePreviewLoaderId );
				if (loader) loader.setStyle( 'display', 'none' );
				// Preview
				this.preview = CKEDITOR.document.getById( previewImageId );

				var editor = this.getParentEditor(),
					sel = this.getParentEditor().getSelection(),
					element = sel.getSelectedElement();

				// Copy of the image
				this.originalElement = editor.document.createElement( 'img' );
				this.originalElement.setAttribute( 'alt', '' );
				this.originalElement.setCustomData( 'isReady', 'false' );

				if ( element && element.getName() == 'img' && !element.data( 'cke-realelement' )
					|| element && element.getName() == 'input' && element.getAttribute( 'type' ) == 'image' )
				{
					this.imageEditMode = element.getName();
					this.imageElement = element;
				}

				if ( this.imageEditMode )
				{
					// Use the original element as a buffer from  since we don't want
					// temporary changes to be committed, e.g. if the dialog is canceled.
					this.cleanImageElement = this.imageElement;
					this.imageElement = this.cleanImageElement.clone( true, true );

					// Fill out all fields.
					this.setupContent( IMAGE, this.imageElement );

					// Refresh LockRatio button
					switchLockRatio ( this, true );
				}

				var showUpload=false;
				var url = element && ( element.data( 'cke-saved-src' ) || element.getAttribute( 'src' ));
				if ( !url || !CKEDITOR.tools.trim( url ) )
				{
					// Don't show preview if no URL given.
					if (this.preview)
					{
						this.preview.removeAttribute( 'src' );
						this.preview.setStyle( 'display', 'none' );
					}
					showUpload=true;
				}

				var self = this;
				window.setTimeout( function() {
					if ( showUpload )
					{
						self.hidePage( "info");
						self.selectPage( "Upload" );
					}
					else
					{
						self.hidePage( "Upload");
					}
				}, 0);

				if (this.preview)
				{
					// Adjust preview size to dialog minimum size
					var minWidth=this.definition.minWidth;
					var minHeight=this.definition.minHeight;
					var div = this.preview.getAscendant("div");

					var divPosition= div.getDocumentPosition();
					var dialogPosition=this.parts.contents.getDocumentPosition();

					var left=divPosition.x - dialogPosition.x;
					var top=divPosition.y - dialogPosition.y;

					div.setStyle("width", (minWidth - left) + "px");
					div.setStyle("height", (minHeight - (top+10)) + "px");
				}
				// Let's handle the OK button first
				this.on( 'ok', function( evt ) {
					// If there's a selected file in the file input, send it.
					var fileInput = this.getContentElement("Upload", "file");
					if (fileInput && fileInput.getValue() !== '' )
					{
						this.getContentElement("Upload", "uploadButton").click();
						evt.data.hide = false;
						evt.stop();
						return;
					}

					var externalInput = this.getContentElement("Upload", "txtExternalUrl");
					var value = externalInput && externalInput.getValue();
					if (externalInput && (value !== '' && value !== 'http://') )
					{
						this.getContentElement("Upload", "useExternalUrl").click();
						evt.data.hide = false;
						evt.stop();
						return;
					}

					// We don't want to change tabs if no file has been selected
					if (this.getContentElement("info", "txtUrl").getValue() == "")
					{
						alert( editor.lang.easyupload.missingUrl );
						evt.data.hide = false;
						evt.stop();
					}

				}, this, null, -1 );

				this.uploadAllowedExtRegex	= new RegExp( editor.config.easyImage_AllowedExtensions, 'i' ) ;

			},
			onOk : function()
			{
				// Edit existing Image.
				if ( this.imageEditMode )
				{
					var imgTagName = this.imageEditMode;

					// Image dialog and Input element.
					if ( dialogType == 'image' && imgTagName == 'input' && confirm( editor.lang.image.button2Img ) )
					{
						// Replace INPUT-> IMG
						imgTagName = 'img';
						this.imageElement = editor.document.createElement( 'img' );
						this.imageElement.setAttribute( 'alt', '' );
						editor.insertElement( this.imageElement );
					}
					// ImageButton dialog and Image element.
					else if ( dialogType != 'image' && imgTagName == 'img' && confirm( editor.lang.image.img2Button ))
					{
						// Replace IMG -> INPUT
						imgTagName = 'input';
						this.imageElement = editor.document.createElement( 'input' );
						this.imageElement.setAttributes(
							{
								type : 'image',
								alt : ''
							}
						);
						editor.insertElement( this.imageElement );
					}
				}
				else	// Create a new image.
				{
					// Image dialog -> create IMG element.
					if ( dialogType == 'image' )
						this.imageElement = editor.document.createElement( 'img' );
					else
					{
						this.imageElement = editor.document.createElement( 'input' );
						this.imageElement.setAttribute ( 'type' ,'image' );
					}
					this.imageElement.setAttribute( 'alt', '' );
				}


				// Set attributes.
				this.commitContent( IMAGE, this.imageElement );

				// Insert a new Image.
				if ( !this.imageEditMode )
				{
						editor.insertElement( this.imageElement );
				}
			},
			onLoad : function()
			{
				var doc = this._.element.getDocument(),
					button;
				button = doc.getById( btnResetSizeId );
				if (button) this.addFocusable( button, 5 );
				button = doc.getById( btnLockSizesId );
				if (button) this.addFocusable( button, 5 );
				this.on( 'resize', function() {

				});

				// Preparing for the 'elementStyle' field.
				var dialog = this,
					 stylesField = this.getContentElement( 'info', 'elementStyle' );

				if ( !stylesField )
					return;

				 // Reuse the 'stylescombo' plugin's styles definition.
				editor.getStylesSet( function( stylesDefinitions )
				{
					var styleName;

					if ( stylesDefinitions )
					{
						// Digg only those styles that apply to 'img'.
						for ( var i = 0 ; i < stylesDefinitions.length ; i++ )
						{
							var styleDefinition = stylesDefinitions[ i ];
							if ( styleDefinition.element && styleDefinition.element == 'img' )
							{
								styleName = styleDefinition.name;
								styles[ styleName ] = new CKEDITOR.style( styleDefinition );

								// Populate the styles field options with style name.
								stylesField.items.push( [ styleName, styleName ] );
								stylesField.add( styleName, styleName );
							}
						}
					}

					// We should disable the content element
					// it if no options are available at all.
					stylesField[ stylesField.items.length > 1 ? 'enable' : 'disable' ]();

					// Now setup the field value manually.
					if ( dialog.imageElement )
						setTimeout( function() { stylesField.setup( IMAGE, dialog.imageElement ); }, 0 );
				} );

			},
			onHide : function()
			{
				if ( this.preview )
					this.commitContent( CLEANUP, this.preview );

				if ( this.originalElement )
				{
					this.originalElement.removeListener( 'load', onImgLoadEvent );
					this.originalElement.removeListener( 'error', onImgLoadErrorEvent );
					this.originalElement.removeListener( 'abort', onImgLoadErrorEvent );
					this.originalElement.remove();
					this.originalElement = false;		// Dialog is closed.
				}
			},
			// IE doesn't like to focus hidden things, so let's disable this function
			onFocus : function()
			{
				return false;
			},
			contents : [
				{
					id : 'info',
					label : editor.lang.image.infoTab,
					elements :
					[
						{
							id : 'txtUrl',
							type : 'text',
							labelLayout : 'vertical',
							label : editor.lang.common.url ,
							onChange : function()
							{
								var dialog = this.getDialog(),
									newUrl = this.getValue();

								//Update original image
								if ( newUrl.length > 0 )	//Prevent from load before onShow
								{
									var original = dialog.originalElement;

									if (dialog.preview)
										dialog.preview.removeStyle( 'display' );

									original.setCustomData( 'isReady', 'false' );
									// Show loader
									var loader = CKEDITOR.document.getById( imagePreviewLoaderId );
									if ( loader )
										loader.setStyle( 'display', '' );

									original.on( 'load', onImgLoadEvent, dialog );
									original.on( 'error', onImgLoadErrorEvent, dialog );
									original.on( 'abort', onImgLoadErrorEvent, dialog );
									original.setAttribute( 'src', newUrl );

									if (dialog.preview)
									{
										dialog.preview.setAttribute( 'src', newUrl );

										updatePreview( dialog );
									}
								}
								// Dont show preview if no URL given.
								else if ( dialog.preview )
								{
									dialog.preview.removeAttribute( 'src' );
									dialog.preview.setStyle( 'display', 'none' );
								}
							},
							setup : function( type, element )
							{
								if ( type == IMAGE )
								{
									var url = element.data( 'cke-saved-src' ) || element.getAttribute( 'src' );
									var field = this;

									this.getDialog().dontResetSize = true;

									// In IE7 the dialog is being rendered improperly when loading
									// an image with a long URL. So we need to delay it a bit. (#4122)
									setTimeout( function()
										{
											field.setValue( url );		// And call this.onChange()
											field.setInitValue();  // prevent warning about changed values.
											field.focus();
										}, 0 );
								}
							},
							commit : function( type, element )
							{
								if ( type == IMAGE && ( this.getValue() || this.isChanged() ) )
								{
									element.data( 'cke-saved-src', this.getValue() );
									element.setAttribute( 'src', this.getValue() );
								}
								else if ( type == CLEANUP )
								{
									element.setAttribute( 'src', '' );	// If removeAttribute doesn't work.
									element.removeAttribute( 'src' );
								}
							},
							validate : CKEDITOR.dialog.validate.notEmpty( editor.lang.image.urlMissing )
						},
						{
							id : 'txtAlt',
							type : 'text',
							label : editor.lang.easyupload.alt,
							accessKey : 'A',
							'default' : '',
							onChange : function()
							{
								updatePreview( this.getDialog() );
							},
							setup : function( type, element )
							{
								if ( type == IMAGE )
									this.setValue( element.getAttribute( 'alt' ) );
							},
							commit : function( type, element )
							{
								if ( type == IMAGE )
								{
									if ( this.getValue() || this.isChanged() )
										element.setAttribute( 'alt', this.getValue() );
								}
								else if ( type == PREVIEW )
								{
									element.setAttribute( 'alt', this.getValue() );
								}
								else if ( type == CLEANUP )
								{
									element.removeAttribute( 'alt' );
								}
							}//,
							// Fixme: add configuration option.
							//validate : CKEDITOR.dialog.validate.notEmpty( editor.lang.easyupload.altMissing )
						},
						{
							type : 'hbox',
							widths : [ '130px', '240px' ],
							children :
							[
								{
									type : 'vbox',
									padding : 5,
									children :
									[
										{
											type : 'hbox',
											id : 'boxSizes',
											widths : [ '70%', '15%', '15%' ],
											children :
											[
												{
													type : 'vbox',
													padding : 1,
													children :
													[
														{
															type : 'text',
															width: '40px',
															id : 'txtWidth',
															labelLayout : 'horizontal',
															label : editor.lang.common.width,
															onKeyUp : onSizeChange,
															validate: function()
															{
																var aMatch  =  this.getValue().match( regexGetSizeOrEmpty );
																if ( !aMatch )
																	alert( editor.lang.common.validateNumberFailed );
																return !!aMatch;
															},
															setup : setupDimension,
															commit : function( type, element )
															{
																if ( type == IMAGE )
																{
																	var value = this.getValue();
																	if ( value )
																		element.setAttribute( 'width', value );
																	else if ( !value && this.isChanged() )
																		element.removeAttribute( 'width' );
																}
																else if ( type == PREVIEW )
																{
																	value = this.getValue();
																	var aMatch = value.match( regexGetSize );
																	if ( !aMatch )
																	{
																		var oImageOriginal = this.getDialog().originalElement;
																		if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' )
																			element.setStyle( 'width',  oImageOriginal.$.width + 'px');
																	}
																	else
																		element.setStyle( 'width', value + 'px');
																}
																else if ( type == CLEANUP )
																{
																	element.setStyle( 'width', '0px' );	// If removeAttribute doesn't work.
																	element.removeAttribute( 'width' );
																	element.removeStyle( 'width' );
																}
															}
														},
														{
															type : 'text',
															id : 'txtHeight',
															width: '40px',
															labelLayout : 'horizontal',
															label : editor.lang.common.height,
															onKeyUp : onSizeChange,
															validate: function()
															{
																var aMatch = this.getValue().match( regexGetSizeOrEmpty );
																if ( !aMatch )
																	alert( editor.lang.common.validateNumberFailed );
																return !!aMatch;
															},
															setup : setupDimension,
															commit : function( type, element )
															{
																if ( type == IMAGE )
																{
																	var value = this.getValue();
																	if ( value )
																		element.setAttribute( 'height', value );
																	else if ( !value && this.isChanged() )
																		element.removeAttribute( 'height' );
																}
																else if ( type == PREVIEW )
																{
																	value = this.getValue();
																	var aMatch = value.match( regexGetSize );
																	if ( !aMatch )
																	{
																		var oImageOriginal = this.getDialog().originalElement;
																		if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' )
																			element.setStyle( 'height',  oImageOriginal.$.height + 'px');
																	}
																	else
																		element.setStyle( 'height', value + 'px');
																}
																else if ( type == CLEANUP )
																{
																	element.setStyle( 'height', '0px' );	// If removeAttribute doesn't work.
																	element.removeAttribute( 'height' );
																	element.removeStyle( 'height' );
																}
															}
														}
													]
												},
												{
													type : 'html',
													id : 'htmlLockSizes',
													style : 'margin-top:10px;width:20px;height:40px;',
													onLoad : function()
													{
														// Activate Reset button
														var	ratioButton = CKEDITOR.document.getById( btnLockSizesId );
														// Activate (Un)LockRatio button
														if ( ratioButton )
														{
															ratioButton.on( 'click', function()
																{
																	var locked = switchLockRatio( this ),
																		oImageOriginal = this.originalElement,
																		width = this.getValueOf( 'info', 'txtWidth' );

																	if ( oImageOriginal.getCustomData( 'isReady' ) == 'true' && width )
																	{
																		var height = oImageOriginal.$.height / oImageOriginal.$.width * width;
																		if ( !isNaN( height ) )
																		{
																			this.setValueOf( 'info', 'txtHeight', Math.round( height ) );
																			updatePreview( this );
																		}
																	}
																}, this.getDialog() );
															ratioButton.on( 'mouseover', function()
																{
																	this.addClass( 'cke_btn_over' );
																}, ratioButton );
															ratioButton.on( 'mouseout', function()
																{
																	this.removeClass( 'cke_btn_over' );
																}, ratioButton );
														}
													},
													html : '<div>'+
														'<a href="javascript:void(0)" tabindex="-1" title="' + editor.lang.image.lockRatio +
														'" class="cke_btn_locked" id="' + btnLockSizesId + '"></a>' +
														'</div>'
												},
												{
													type : 'html',
													id : 'htmlResetSize',
													style : 'margin-top:10px;width:20px;height:40px;',
													onLoad : function()
													{
														// Activate Reset button
														var	resetButton = CKEDITOR.document.getById( btnResetSizeId );
														if ( resetButton )
														{
															resetButton.on( 'click', function()
																{
																	resetSize( this );
																}, this.getDialog() );
															resetButton.on( 'mouseover', function()
																{
																	this.addClass( 'cke_btn_over' );
																}, resetButton );
															resetButton.on( 'mouseout', function()
																{
																	this.removeClass( 'cke_btn_over' );
																}, resetButton );
														}
													},
													html : '<div>'+
														'<a href="javascript:void(0)" tabindex="-1" title="' + editor.lang.image.resetSize +
														'" class="cke_btn_reset" id="' + btnResetSizeId + '"></a>'+
														'</div>'
												}
											]
										},
								{
									id :'elementStyle',
									type :'select',
									style :'width: 100%;',
									label :editor.lang.easyupload.styleSelectLabel,
									'default' : '',
									// Options are loaded dynamically.
									items :
									[
										[ editor.lang.common.notSet , '' ]
									],
									onChange : function()
									{
										updatePreview( this.getDialog() );
									},
									setup : function( type, element )
									{
										for ( var name in styles )
											styles[ name ].checkElementRemovable( element, true ) && this.setValue( name );
									},
									commit: function( type, element )
									{
										var styleName;
										if ( ( styleName = this.getValue() ) )
										{
											var style = styles[ styleName ];
											var customData = element.getCustomData( 'elementStyle' ) || '';

											style.applyToObject( element );
											element.setCustomData( 'elementStyle', customData + style._.definition.attributes.style );
										}
									}
								},
								{
									type : 'html',
									style: 'white-space:normal; display:block; width:150px;',
									html : editor.lang.easyupload.stylesIntro
								},
								{
									type : 'text',
									id : 'txtGenTitle',
									label : editor.lang.common.advisoryTitle,
									hidden : true,
									'default' : '',
									onChange : function()
									{
										updatePreview( this.getDialog() );
									},
									setup : function( type, element )
									{
										if ( type == IMAGE )
											this.setValue( element.getAttribute( 'title' ) );
									},
									commit : function( type, element )
									{
										if ( type == IMAGE )
										{
											if ( this.getValue() || this.isChanged() )
												element.setAttribute( 'title', this.getValue() );
										}
										else if ( type == PREVIEW )
										{
											element.setAttribute( 'title', this.getValue() );
										}
										else if ( type == CLEANUP )
										{
											element.removeAttribute( 'title' );
										}
									}
								}

									]
								},
								{
									type : 'html',
									id : 'htmlPreview',
											style : 'width:95%;',
											html : '<div>' + CKEDITOR.tools.htmlEncode( editor.lang.common.preview ) +'<br>'+
											'<div id="' + imagePreviewLoaderId + '" class="ImagePreviewLoader" style="display:none"><div class="loading">&nbsp;</div></div>'+
											'<div class="ImagePreviewBox"><table><tr><td>'+
											'<a href="javascript:void(0)" target="_blank" onclick="return false;">'+
											'<img id="' + previewImageId + '" alt="" /></a>' +
											( editor.config.image_previewText ||
											'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. '+
											'Maecenas feugiat consequat diam. Maecenas metus. Vivamus diam purus, cursus a, commodo non, facilisis vitae, '+
											'nulla. Aenean dictum lacinia tortor. Nunc iaculis, nibh non iaculis aliquam, orci felis euismod neque, sed ornare massa mauris sed velit. Nulla pretium mi et risus. Fusce mi pede, tempor id, cursus ac, ullamcorper nec, enim. Sed tortor. Curabitur molestie. Duis velit augue, condimentum at, ultrices a, luctus ut, orci. Donec pellentesque egestas eros. Integer cursus, augue in cursus faucibus, eros pede bibendum sem, in tempus tellus justo quis ligula. Etiam eget tortor. Vestibulum rutrum, est ut placerat elementum, lectus nisl aliquam velit, tempor aliquam eros nunc nonummy metus. In eros metus, gravida a, gravida sed, lobortis id, turpis. Ut ultrices, ipsum at venenatis fringilla, sem nulla lacinia tellus, eget aliquet turpis mauris non enim. Nam turpis. Suspendisse lacinia. Curabitur ac tortor ut ipsum egestas elementum. Nunc imperdiet gravida mauris.' ) +
											'</td></tr></table></div></div>'
								}
							]
						}
					]
				},
				{
					id : 'Upload',
					label : editor.lang.image.upload,
					padding : 12,
					elements :
					[
							{
							type: 'vbox',
							id: 'boxQuickUpload',
							padding: 2,
							children:
							[
							{
								type : 'file',
								id : 'file',
								label : editor.lang.easyupload.selectFromYourComputer,
								style: 'height:40px',
								size : 38,

								onChange : function (ev)
								{
									// Automatically send the file
									if (!editor.config.easyImage_RequireContinue)
										this.getDialog().getContentElement("Upload", "uploadButton").click();
								}
							},
							{
								type : 'fileButton',
								id : 'uploadButton',
								style : 'visibility:hidden',
								filebrowser :
								{
									action : 'QuickUpload', //required
									target : 'info:txtUrl', //required
									// define our own onSelect function so the alerts about renamed files aren't shown.
									onSelect : function( fileUrl, data )
									{
										var dialog = this.getDialog();
										dialog.hideThrobber();

										if ( fileUrl )
										{
											var element = dialog.getContentElement( "info", "txtUrl" );
											element.setValue(fileUrl);
											dialog.selectPage( "info" );
										}
										else
										{
											if (data && typeof data == 'string')
												alert(data);
										}
										return false;
									}
								},
								label : editor.lang.image.btnUpload,

								// Workaround for bug #4773
								onLoad : function(event) {
									this.on( 'click', this.atClick, this, null, 9);
								},
								atClick : function(event) {
									var dialog = event.data.dialog,
										element = dialog.getContentElement( "Upload", "file" ),
										value = element.getValue();

									if ( value == "")
									{
										alert( editor.lang.easyupload.fileNotSelected );
										event.stop();
										return false;
									}

									if ( editor.config.easyImage_AllowedExtensions && !dialog.uploadAllowedExtRegex.test( value ) )
									{
										alert( editor.lang.easyupload.invalidExtension );
										event.stop();
										return false;
									}

									dialog.showThrobber();

								},
								'for' : [ 'Upload', 'file' ]
							}
							]
						},
						{
							type : 'vbox',
							id: 'boxBrowseFromServer',
							padding : 2,
							hidden: true,
							children :
							[
								{
									type : 'html',
									html : '<span>' + CKEDITOR.tools.htmlEncode( editor.lang.easyupload.selectFromServer ) + '</span>'
								},
								{
									type : 'button',
									id : 'browse',
									align : 'center',
									label : editor.lang.common.browseServer,
									filebrowser : 'info:txtUrl'
								}
							]
						},
						{
							type : 'vbox',
							id : 'boxExternalUrl',
							padding : 2,
							children :
							[
								{
									id : 'txtExternalUrl',
									type : 'text',
									'default' : 'http://',
									label : editor.lang.easyupload.selectExternalImage
								},
								{
									type : 'button',
									id : 'useExternalUrl',
									align : 'center',
									label : editor.lang.easyupload.useExternalImage,
									onClick : function(event) {
										var dialog = event.data.dialog;
										var value = dialog.getValueOf('Upload', 'txtExternalUrl');
										if (value == '' || value == 'http://')
										{
											alert(editor.lang.easyupload.missingExternalImage);
											return;
										}
										// Clear the field:
										dialog.setValueOf( 'Upload', 'txtExternalUrl', '');

										dialog.setValueOf( 'info', 'txtUrl', value);
										dialog.selectPage( 'info');
									}
								}
							]
						}

					]
				}
			]
		};
	};

	CKEDITOR.dialog.add( 'easyImage', function( editor )
		{
			return imageDialog( editor, 'image' );
		});

})();
