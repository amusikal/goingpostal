/*
 * @file EasyUpload plugin
*/

CKEDITOR.plugins.add( 'easyupload',
{
	// translations
	lang : ['en'],

	init : function( editor )
	{
		CKEDITOR.dialog.add( 'easyLink', this.path + 'dialogs/link.js' );
		CKEDITOR.dialog.add( 'easyImage', this.path + 'dialogs/image.js' );

		editor.on( 'doubleclick', function( evt )
			{
				var element = evt.data.element;

				if ( element.is( 'img' ) && !element.data( 'cke-realelement' ) && !element.isReadOnly() )
					evt.data.dialog = 'easyImage';
			});

		editor.on( 'doubleclick', function( evt )
			{
				var element = CKEDITOR.plugins.link.getSelectedLink( editor ) || evt.data.element;

				if ( !element.isReadOnly() )
				{
					if ( element.is( 'a' ) )
					{
						evt.data.dialog = ( element.getAttribute( 'name' ) && ( !element.getAttribute( 'href' ) || !element.getChildCount() ) ) ? 'anchor' : 'easyLink';
						editor.getSelection().selectElement( element );
					}
					else if ( CKEDITOR.plugins.link.tryRestoreFakeAnchor( editor, element ) )
						evt.data.dialog = 'anchor';
				}
			});

		// Inject the throbber styles in the page:
		// If this were part of the official code it should be placed in the dialog.css skin
		// We must specify the .cke_throbber for the inner divs or the reset css won't allow to use the background-color
		var rules = [".cke_throbber div {float: left; width: 8px; height: 9px; margin-left: 2px; margin-right: 2px; font-size: 1px;}",
					".cke_throbber .cke_throbber_1 {background-color: #737357;}",
					".cke_throbber .cke_throbber_2 {background-color: #8f8f73;}",
					".cke_throbber .cke_throbber_3 {background-color: #abab8f;}",
					".cke_throbber .cke_throbber_4 {background-color: #c7c7ab;}",
					".cke_throbber .cke_throbber_5 {background-color: #e3e3c7;}"].join(' ');

		// Create a <style> element in the <head>
		var throbberStyles = document.createElement('style');
		throbberStyles.type = "text/css";
		throbberStyles.id = "throbberStyles";

		document.getElementsByTagName('head')[0].appendChild(throbberStyles);

		// Append our rules there. IE requires specific code or it complains about the appendChild
		var styleSheets = document.styleSheets;
		if (styleSheets[0].owningElement)
		{
			for(var i=0;i<styleSheets.length; i++)
			{
				var sheet = styleSheets[i];
				if (sheet.owningElement.id == "throbberStyles")
				{
					sheet.cssText = rules;
					break;
				}
			}
		}
		else
			throbberStyles.appendChild( document.createTextNode( rules ) );

		// End of CSS injection


// Manages the throbber animation that appears to show a lengthy operation
CKEDITOR.dialog.prototype.throbber = {
	update : function()
	{
		var throbberParent = this.throbberCover.getFirst().$,
			throbberBlocks = throbberParent.childNodes,
			lastClass = throbberParent.lastChild.className;

		// From the last to the second one, copy the class from the previous one.
		for ( var i = throbberBlocks.length - 1 ; i > 0 ; i-- )
			throbberBlocks[i].className = throbberBlocks[i-1].className ;

		// For the first one, copy the last class (rotation).
		throbberBlocks[0].className = lastClass ;
	},

	create: function( dialog )
	{
		if (this.throbberCover)
			return;

		var cover = CKEDITOR.dom.element.createFromHtml( '<div style="background-color:#FFF;width:100%;height:100%;top:0;left:0; position:absolute; visibility:none;"></div>');
		cover.setOpacity(0.8);

		cover.appendTo(dialog.parts.contents);
		this.throbberCover = cover;

		var throbberParent = new CKEDITOR.dom.element('div');
		cover.append(throbberParent).addClass("cke_throbber");
		// To get the correct dimensions of the blocks
		throbberParent.setStyle("position", "absolute");

		if (CKEDITOR.env.ie && CKEDITOR.env.version==6)
		{
			cover.setStyle('width', dialog.parts.dialog.$.offsetWidth);
			cover.setStyle('height', dialog.parts.dialog.$.offsetHeight);
		}

		// Create the throbber blocks.
		var classIds = [ 1,2,3,4,5,4,3,2 ] ;
		while ( classIds.length > 0 )
			throbberParent.append( new CKEDITOR.dom.element('div') ).addClass('cke_throbber_' + classIds.shift()) ;

		// Center the throbber
		var x = ( cover.$.offsetWidth - throbberParent.$.offsetWidth ) / 2,
			y = ( cover.$.offsetHeight - throbberParent.$.offsetHeight ) / 2;
		throbberParent.setStyle( 'left', parseInt( x, 10 ) + 'px' );
		throbberParent.setStyle( 'top', parseInt( y, 10 ) + 'px' );

		// Protection if the dialog is closed without removing the throbber
		dialog.on('hide', this.hide, this);
	},
	show : function( waitMilliseconds )
	{
		this.throbberCover.setStyle("visibility", "");

		// Setup the animation interval.
		this.timer = setInterval( CKEDITOR.tools.bind(this.update, this), 100 ) ;
	},
	hide : function()
	{
		if ( this.timer )
		{
			clearInterval( this.timer ) ;
			this.timer = null ;
		}

		if (!this.throbberCover)
			return;

		this.throbberCover.setStyle("visibility", "hidden");
	}
}

CKEDITOR.dialog.prototype.showThrobber = function( waitMilliseconds ) {

		// Auto-setup the Show function to be called again after the
		// requested amount of time.
		if ( waitMilliseconds && waitMilliseconds > 0 )
		{
			timer = CKEDITOR.tools.setTimeout( this.showThrobber, waitMilliseconds, this, this, window ) ;
			return ;
		}

		// we need to specify the dialog were the DOM elements must be attached
		// if we could get the current dialog automatically then this call could be done
		// automatically at the throbber object without this wrapper function
		this.throbber.create( this );

		this.throbber.show(waitMilliseconds);
}

// For parity with .showThrobber
CKEDITOR.dialog.prototype.hideThrobber = function() {
		this.throbber.hide();
}

// end Throbber


	},

	afterInit: function(editor)
	{
		// overwrite default commands
		editor.addCommand( 'link', new CKEDITOR.dialogCommand( 'easyLink' ) );
		editor.addCommand( 'image', new CKEDITOR.dialogCommand( 'easyImage' ) );


		// Remove the default context menu for elements that aren't being used in the toolbar.
		// This object is composed of the command name and the name of the context menu entry
//		var removableEntries = {Image:'image',Link:'link',Unlink:'unlink',EasyImage:'easyimage',EasyLink:'easylink',EasyUnlink:'easyunlink'},
		var removableEntries = {Image:'image',Link:'link',EasyImage:'easyimage',EasyLink:'easylink'},
			// Get the data that is being used for the toolbar, we end with an array of arrays.
			toolbar =
					( editor.config.toolbar instanceof Array ) ?
						editor.config.toolbar
					:
						editor.config[ 'toolbar_' + editor.config.toolbar ];

		// Loop the main array (composed of groups of commands)
		for (var i=0; i<toolbar.length; i++)
		{
			var items = toolbar[i];
			if (!items)
				continue;

			for (var j=0; j<items.length; j++)
			{
				var item = items[j];
				// If it was marked at our check object remove it because it's in use
				if (removableEntries[item])
					delete removableEntries[item] ;
			}
		}

		// Remove all the entries that aren't used in the toolbar
		for (var command in removableEntries)
			delete editor._.menuItems[ removableEntries[command] ];

		// The EasyUnlink command doesn't have its own button, it has been defined only to
		// show it in the context menu at the right position.
		// So let's match its behavior to the EasyLink:
		if (removableEntries.EasyLink)
			delete editor._.menuItems[ 'easyunlink' ];

		if (removableEntries.Link)
			delete editor._.menuItems[ 'unlink' ];
	}



} );



CKEDITOR.tools.extend( CKEDITOR.config,
{
	easyImage_RequireContinue : false,
	easyImage_AllowedExtensions : ".(jpg|gif|jpeg|png)$"
} );
