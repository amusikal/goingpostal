/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.dialog.add( 'easyLink', function( editor )
{
	var plugin = CKEDITOR.plugins.link;

	// Handles the event when the "Type" selection box is changed.
	var linkTypeChanged = function()
	{
		var dialog = this.getDialog(),
			typeValue = this.getValue();

		if ( typeValue == 'url' )
		{
			dialog.getContentElement( 'info', 'linkTargetType').getElement().show();
			dialog.getContentElement( 'info', 'url').getElement().show();
			dialog.getContentElement( 'info', 'emailAddress').getElement().hide();
		}
		else
		{
			dialog.getContentElement( 'info', 'linkTargetType').getElement().hide();
			dialog.getContentElement( 'info', 'url').getElement().hide();
			dialog.getContentElement( 'info', 'emailAddress').getElement().show();
		}
	};

	// Loads the parameters in a selected link to the link dialog fields.
	var javascriptProtocolRegex = /^javascript:/,
		emailRegex = /^mailto:([^?]+)(?:\?(.+))?$/,
		emailSubjectRegex = /subject=([^;?:@&=$,\/]*)/,
		emailBodyRegex = /body=([^;?:@&=$,\/]*)/,
		anchorRegex = /^#(.*)$/,
		urlRegex = /^((?:http|https|ftp|news):\/\/)?(.*)$/,
		selectableTargets = /^(_(?:self|top|parent|blank))$/,
		encodedEmailLinkRegex = /^javascript:void\(location\.href='mailto:'\+String\.fromCharCode\(([^)]+)\)(?:\+'(.*)')?\)$/,
		functionCallProtectedEmailLinkRegex = /^javascript:([^(]+)\(([^)]+)\)$/;

	var popupRegex =
		/\s*window.open\(\s*this\.href\s*,\s*(?:'([^']*)'|null)\s*,\s*'([^']*)'\s*\)\s*;\s*return\s*false;*\s*/;
	var popupFeaturesRegex = /(?:^|,)([^=]+)=(\d+|yes|no)/gi;

	var parseLink = function( editor, element )
	{
		var href = ( element  && ( element.data( 'cke-saved-href' ) || element.getAttribute( 'href' ) ) ) || '',
		 	javascriptMatch,
			emailMatch,
			anchorMatch,
			urlMatch,
			retval = {};

		if ( !retval.type )
		{
			// Protected email link as encoded string.
			if ( ( emailMatch = href.match( emailRegex ) ) )
			{
				var subjectMatch = href.match( emailSubjectRegex ),
					bodyMatch = href.match( emailBodyRegex );

				retval.type = 'email';
				var email = ( retval.email = {} );
				email.address = emailMatch[ 1 ];
				subjectMatch && ( email.subject = decodeURIComponent( subjectMatch[ 1 ] ) );
				bodyMatch && ( email.body = decodeURIComponent( bodyMatch[ 1 ] ) );
			}
			// urlRegex matches empty strings, so need to check for href as well.
			else if (  href && ( urlMatch = href.match( urlRegex ) ) )
			{
				retval.type = 'url';
				retval.url = {};
				retval.url.url = href;
			}
			else
				retval.type = 'url';
		}

		// Load target and popup settings.
		if ( element )
		{
			var target = element.getAttribute( 'target' );
			retval.target = {};
			retval.adv = {};

			// IE BUG: target attribute is an empty string instead of null in IE if it's not set.
			if ( !target )
			{
				var onclick = element.data( 'cke-pa-onclick' ) || element.getAttribute( 'onclick' ),
					onclickMatch = onclick && onclick.match( popupRegex );
				if ( onclickMatch )
				{
					retval.target.type = 'popup';
					retval.target.name = onclickMatch[1];

					var featureMatch;
					while ( ( featureMatch = popupFeaturesRegex.exec( onclickMatch[2] ) ) )
					{
						// Some values should remain numbers (#7300)
						if ( ( featureMatch[2] == 'yes' || featureMatch[2] == '1' ) && !( featureMatch[1] in { height:1, width:1, top:1, left:1 } ) )
							retval.target[ featureMatch[1] ] = true;
						else if ( isFinite( featureMatch[2] ) )
							retval.target[ featureMatch[1] ] = featureMatch[2];
					}
				}
			}
			else
			{
				var targetMatch = target.match( selectableTargets );
				if ( targetMatch )
					retval.target.type = retval.target.name = target;
				else
				{
					retval.target.type = 'frame';
					retval.target.name = target;
				}
			}

			var me = this;
		}

		// Record down the selected element in the dialog.
		this._.selectedElement = element;
		return retval;
	};

	var setupParams = function( page, data )
	{
		if ( data[page] )
			this.setValue( data[page][this.id] || '' );
	};

	var commitParams = function( page, data )
	{
		if ( !data[page] )
			data[page] = {};

		data[page][this.id] = this.getValue() || '';
	};


	var commonLang = editor.lang.common,
		linkLang = editor.lang.link;

	return {
		title : linkLang.title,
		minWidth : 350,
		minHeight : 120,
		contents : [
			{
				id : 'info',
				label : linkLang.info,
				title : linkLang.info,
				elements :
				[
					{
						type : 'hbox',
						children :
						[
							{
								id : 'linkType',
								type : 'select',
								label : linkLang.type,
								'default' : 'url',
								items :
								[
									[ linkLang.toUrl, 'url' ],
									[ linkLang.toEmail, 'email' ]
								],
								onChange : linkTypeChanged,
								setup : function( data )
								{
									if ( data.type )
										this.setValue( data.type );
								},
								commit : function( data )
								{
									data.type = this.getValue();
								}
							},
							{
								type : 'select',
								id : 'linkTargetType',
								label : commonLang.target,
								'default' : 'notSet',
								style : 'width : 100%;',
								'items' :
								[
									[ commonLang.notSet, 'notSet' ],
									[ commonLang.targetNew, '_blank' ]
								],

								setup : function( data )
								{
									if ( data.target )
										this.setValue( data.target.type || 'notSet' );
								},
								commit : function( data )
								{
									if ( !data.target )
										data.target = {};

									data.target.type = this.getValue();
								}
							}
						]
					},
					{
						type : 'text',
						id : 'url',
						label : commonLang.url,
						required: true,
						onLoad : function ()
						{
							this.allowOnChange = true;
						},
						validate : function()
						{
							var dialog = this.getDialog();

							if ( dialog.getContentElement( 'info', 'linkType' ) &&
									dialog.getValueOf( 'info', 'linkType' ) != 'url' )
								return true;

							if ( this.getDialog().fakeObj )	// Edit Anchor.
								return true;

							var func = CKEDITOR.dialog.validate.notEmpty( linkLang.noUrl );
							return func.apply( this );
						},
						setup : function( data )
						{
							this.allowOnChange = false;
							if ( data.url )
								this.setValue( data.url.url );
							this.allowOnChange = true;

						},
						commit : function( data )
						{
							if ( !data.url )
								data.url = {};

							data.url.url = this.getValue();
							this.allowOnChange = false;
						}

					},
					{
						type : 'text',
						id : 'emailAddress',
						label : linkLang.emailAddress,
						required : true,
						validate : function()
						{
							var dialog = this.getDialog();

							if ( !dialog.getContentElement( 'info', 'linkType' ) ||
									dialog.getValueOf( 'info', 'linkType' ) != 'email' )
								return true;

							var func = CKEDITOR.dialog.validate.notEmpty( linkLang.noEmail );
							return func.apply( this );
						},
						setup : function( data )
						{
							if ( data.email )
								this.setValue( data.email.address );

							var linkType = this.getDialog().getContentElement( 'info', 'linkType' );
							if ( linkType && linkType.getValue() == 'email' )
								this.select();
						},
						commit : function( data )
						{
							if ( !data.email )
								data.email = {};

							data.email.address = this.getValue();
						}
					}
				]
			}

		],
		onShow : function()
		{
			var editor = this.getParentEditor(),
				selection = editor.getSelection(),
				element = null;

			// Fill in all the relevant fields if there's already one link selected.
			if ( ( element = plugin.getSelectedLink( editor ) ) && element.hasAttribute( 'href' ) )
				selection.selectElement( element );
			else
				element = null;

			this.setupContent( parseLink.apply( this, [ editor, element ] ) );
		},
		onOk : function()
		{
			var attributes = {},
				removeAttributes = [],
				data = {},
				me = this,
				editor = this.getParentEditor();

			this.commitContent( data );

			// Compose the URL.
			switch ( data.type || 'url' )
			{
				case 'url':
					var url = ( data.url && CKEDITOR.tools.trim( data.url.url ) ) || '';
					attributes[ 'data-cke-saved-href' ] = url;
					break;

				case 'email':

					var linkHref,
						email = data.email,
						address = email.address;

							var subject = encodeURIComponent( email.subject || '' ),
								body = encodeURIComponent( email.body || '' );

							// Build the e-mail parameters first.
							var argList = [];
							subject && argList.push( 'subject=' + subject );
							body && argList.push( 'body=' + body );
							argList = argList.length ? '?' + argList.join( '&' ) : '';

								linkHref = [ 'mailto:', address, argList ];


					attributes[ 'data-cke-saved-href' ] = linkHref.join( '' );
					break;
			}

			// Popups and target.
			if ( data.target )
			{
					if ( data.target.type != 'notSet' )
						attributes.target = data.target.type;
					else
						removeAttributes.push( 'target' );

					removeAttributes.push( 'data-cke-pa-onclick', 'onclick' );
			}


			// Browser need the "href" for copy/paste link to work. (#6641)
			attributes.href = attributes[ 'data-cke-saved-href' ];

			if ( !this._.selectedElement )
			{
				// Create element if current selection is collapsed.
				var selection = editor.getSelection(),
					ranges = selection.getRanges( true );
				if ( ranges.length == 1 && ranges[0].collapsed )
				{
					// Short mailto link text view (#5736).
					var text = new CKEDITOR.dom.text( data.type == 'email' ?
							data.email.address : attributes[ 'data-cke-saved-href' ], editor.document );
					ranges[0].insertNode( text );
					ranges[0].selectNodeContents( text );
					selection.selectRanges( ranges );
				}

				// Apply style.
				var style = new CKEDITOR.style( { element : 'a', attributes : attributes } );
				style.type = CKEDITOR.STYLE_INLINE;		// need to override... dunno why.
				style.apply( editor.document );
			}
			else
			{
				// We're only editing an existing link, so just overwrite the attributes.
				var element = this._.selectedElement,
					href = element.data( 'cke-saved-href' ),
					textView = element.getHtml();

				element.setAttributes( attributes );
				element.removeAttributes( removeAttributes );

				if ( data.adv && data.adv.advName && CKEDITOR.plugins.link.synAnchorSelector )
					element.addClass( element.getChildCount() ? 'cke_anchor' : 'cke_anchor_empty' );

				// Update text view when user changes protocol (#4612).
				if ( href == textView || data.type == 'email' && textView.indexOf( '@' ) != -1 )
				{
					// Short mailto link text view (#5736).
					element.setHtml( data.type == 'email' ?
						data.email.address : attributes[ 'data-cke-saved-href' ] );
				}

				delete this._.selectedElement;
			}
		},

		// Inital focus on 'url' field if link is of type URL.
		onFocus : function()
		{
			var linkType = this.getContentElement( 'info', 'linkType' ),
					urlField;
			if ( linkType && linkType.getValue() == 'url' )
			{
				urlField = this.getContentElement( 'info', 'url' );
				urlField.select();
			}
		}
	};
});

