(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    CKEDITOR.replace('description');
    CKEDITOR.config.toolbar = [{
      items: ['Bold', 'Italic'],
      name: 'basicstyles'
    }];
  });

  var PSWeeDisplay = new Class({
    Implements: Options,
    image_formats: ['bmp', 'gif', 'jpg', 'png', 'swf'],
    options: {
      baseUri: 'http://weemeeimages.primarysite.net/',
      partnerCode: null,
      uniqueId: null,
      container: null,
      display: true,
      dimension: 200,
      dimensionType: 'width',
      imageFormat: 'swf',
      showlogo: false,
      xPad: 0,
      yPad: 0,
      showEnvironment: true,
      flashWMode: 'transparent',
      flashQuality: 'high',
      flashAllowScriptAccess: 'always',
      flashBGColor: '#fff',
    },
    shown: false,
    swiff: null,
    built: false,
    initialize: function(options) {
      this.container = $(options.container);
      this.setOptions(options);
      this.updateWeemee();
    },
    updateWeemee: function(options) {
      if(options) {
        for(id in options) {
          this.options[id] = options[id];
        }
      }

      if (this.container) {
        this.buildUri();
        this.container.store('controller', this);
        if(this.options.display) {
          this.show();
        }
      }
    },
    buildUri: function() {
      var uri = this.options.baseUri;
      uri    += this.options.partnerCode+"/";
      uri    += this.options.uniqueId+"/weemee/";

      var width = 0, height = 0;
      if (this.options.dimensionType == 'width') {
        uri += "width";
        width = this.options.dimension;
        height = this.options.dimension * 1.075;
      } else if (this.options.dimensionType == 'height') {
        uri += "height";
        width = this.options.dimension / 1.075;
        height = this.options.dimension;
      } else if (this.options.dimensionType == 'scale') {
        uri += "scale";
        width = 200 * this.options.dimension;
        height = 215 * this.options.dimension;
      }

      this.container.setStyle("width", width);
      this.container.setStyle("height", height);

      uri += "/"+this.options.dimension+"."+this.options.imageFormat+"?";
      uri += "showlogo="+(this.options.showlogo ? 'true' : 'false')+"&";
      if(this.options.xPad) uri += "xPad="+this.options.xPad+"&";
      else if(this.options.yPad) uri += "yPad="+this.options.yPad+"&";
      uri += "showenvironment="+(this.options.showEnvironment ? 'true' : 'false')+"&";
      uri += "time="+$time();

      if (this.options.imageFormat == 'swf') {
        var params = {
          wmode: this.options.flashWMode,
          quality: this.options.flashQuality,
          bgcolor: this.options.flashBGColor,
          allowScriptAccess: this.options.flashAllowScriptAccess,
        };

        this.swiff = new Swiff(uri, {
          width: width,
          height: height,
          container: this.container,
          params: params,
          callBacks: {}
        });

        if (!this.options.display) {
          this.swiff.toElement().setStyle("display", "none");
        }
      } else {
        var element = new Element('img', {
          src: uri,
          width: width,
          height: height,
          alt: 'Weemee Avatar Image'
        });
        element.inject(this.container);
      }

      this.built = true;
  },
  show: function() {
    if (!this.built) {
      return;
    }

    this.shown = true;
    this.container.setStyle("display", "");

    if (this.swiff) {
      this.swiff.toElement().setStyle("display", "");
    }
  },
  hide: function() {
    if (!this.built) {
      return;
    }

    this.shown = false;
    this.container.setStyle("display", "none");

    if (this.swiff) {
      this.swiff.toElement().setStyle("display", "none");
    }
  },
  toggle: function() {
    if (this.shown) {
      this.hide();
    } else {
      this.show();
    }
  },
  destroy: function() {
    if (this.built) {
      this.container.empty();
      if (this.swiff) {
        this.swiff.toElement().dispose();
      }
      this.swiff = null;
      this.built = false;
    }
  }
})

window.PSWeeEditor = new Class({
  options: {
    builderGAToken: null,
    partnerId: null,
    uniqueId: null,
    key: null,
    container: null,
    show: true,

    width: 848,
    height: 300,
    wmode: 'transparent',
    quality: 'high',
    bgcolor: '#fff',
    allowScriptAccess: 'always',

    movie: 'http://api.weeworld.com/flash/builder_preloader.swf',
    file: 'http://api.weeworld.com/flash/builder_container.swf',
    culture: 'en-gb',
    environmentsConfiguration: 'http://weemee.primarysite.net /flash/configuration/environments/environments.aspx',
    builderConfiguration: {
      url: 'http://weemee.primarysite.net/flash/configuration/builder/builderConfiguration.aspx',
      params: {
        culture: 'en-gb',
        theme: 'default_theme',
        allowTravelToPartner: 'True',
        allowVisitWeeWorldDlg: 'False',
        allowVisitWeeWorldBtn: 'False'
        },
        addParams: ['pId']
    },

    baseConfiguration: 'http://weemee.primarysite.net/flash/configuration/builder/containerConfiguration.aspx',
    wwLinkUrl: {
        url: 'http://www.weeworld.com/partnerbridge/PartnerJunction.aspx'+
                '?Token=967722b6281de261416849337f04fc00&Redirect=&',
        addParams: ['partId', 'partUserId'],
        params: [],
    },
    vars: [
      'environmentsConfiguration',
      'builderConfiguration',
      'baseConfiguration',
      'builderArgs',
      'wwLinkUrl'
    ],
    weeSaveCallback: function( ) { }
    },
    isSaved: false,
    show: false,
    toggleLinks: [],
    Implements: Options,

    initEventHandler: function( ) {
      window.WeeWorldEventHandler = function(a,b) {
        switch(a) {
          case 'weehome_builder_save':
            this.isSaved = true;
            this.options.weeSaveCallback();
            break;
        }
      }.bind(this);

      if (!window.pointsNotificationActive) {
        window.pointsNotificationActive = function(bool) {};
      }
      if (!window.setFlashBuilderDim) {
        window.setFlashBuilderDim = function(a,b) {};
      }
    },

    initialize: function(options) {
      this.setOptions(options);
      this.initEventHandler();

      this.container = $(this.options.container);

      if (this.container) {
        this.container.store('controller', this);
        var allEls = this.container.getElements("div").clone();
        var elements = allEls.getElements("a.activeLink").flatten();
        this.toggleLinks = elements;

        elements.each(function(el) {
          el.addEvent('click', function(ev) {
            new Event(ev).stop();
            this.toggle();
          }.bind(this));
        }.bind(this));

        if (this.options.builderGAToken && window.urchinTracker) {
          _uacct = this.options.buildGAToken;
          urchinTracker();
        }

        var params = {
          'wmode': this.options.wmode,
          'quality': this.options.quality,
          'bgcolor': this.options.bgcolor,
          'allowScriptAccess': this.options.allowScriptAccess,
          'movie': this.options.movie
        };

        var vars = {
          file: this.options.file,
          culture: this.options.culture,
          environmentsConfiguration: this.options.environmentsConfiguration,
          baseConfiguration: this.options.baseConfiguration
        };

        vars['builderArgs'] = Hash.toQueryString({
          partnerId: this.options.partnerId,
          uniqueId: this.options.uniqueId,
          key: this.options.key
        });

        this.options.pId = this.options.partnerId;
        this.options.partUserId = this.options.uniqueId;

        this.options.builderConfiguration.addParams.each(function(p) {
          this.options.builderConfiguration.params[p] = this.options[p];
        }.bind(this));

        vars['builderConfiguration'] = this.options.builderConfiguration.url+"?"+
          decodeURIComponent(
              Hash.toQueryString(this.options.builderConfiguration.params)
          );

        this.options['partId'] = this.options.partnerId;
        this.options['partUserId'] = this.options.uniqueId;

        this.options.wwLinkUrl.addParams.each(function(p) {
          this.options.wwLinkUrl.params[p] =
          this.options[p];
        }.bind(this));

        vars['wwLinkUrl'] = this.options.wwLinkUrl.url+
          decodeURIComponent(
            Hash.toQueryString(this.options.wwLinkUrl.params)
          );

        vars['vars'] = this.options.vars.join(",");

        this.swiff = new Swiff(this.options.movie, {
          width: this.options.width,
          height: this.options.height,
          container: this.options.container,
          params: params,
          vars: vars,
          callBacks: {
            load: this.options.loadCallback ? this.options.loadCallBack : function(){}
          }
        });

        allEls.inject(this.options.container);

        if (!this.options.display) {
          this.hide();
        } else {
          this.show();
        }

      }
    },

    show: function() {
      this.shown = true;
      this.container.setStyle('left', -this.options.width);
      this.swiff.toElement().setStyle("display", "");
      this.container.tween('left', 0);

      this.toggleLinks.each(function(el) { el.removeClass("hidden"); });
      this.toggleLinks.each(function(el) { el.addClass("shown"); });

      this.isSaved = false;
    },
    hide: function( ) {
      this.shown = false;
      this.container.tween('left', -this.options.width);
      var opts = this.swiff.toElement().get('tween').options;
      (function( ) {
        this.swiff.toElement().setStyle("display", "none");
      }.bind(this)).delay(opts.duration);
      this.toggleLinks.each(function(el) { el.addClass("hidden"); });
      this.toggleLinks.each(function(el) { el.removeClass("shown"); });
    },
    toggle: function( ) {
      if(this.shown) {
        this.hide();
      } else {
        this.show();
      }
    },
    destroy: function() {
      this.hide();
      this.container.empty();
    }
});

  function updateWeeMee() {
    popup.dispose();
    var bc = $$('body')[0].retrieve('controller');
    if (bc) {
      bc.addStatusFlash("{% trans 'Thank you, your avatar has been updated.' %}", true);
    }
    $$('img.weemee').each(function(el) {
      el.set('src', el.get('src') + "&time="+$time());
    });
  }

  function displayEditor() {
    var url = $('editWeeMeeBttn').get('href');
    var request = new Request.HTML({
      url: url,
      evalScripts: true,
      onComplete: function(resp, tree, html, script) {
        var popup = new Element("div", {'class': 'popup'});
        var body = $$('body')[0];
        var dims = body.getDimensions();
        var pos = body.getScroll();
        popup.setStyle('position', 'absolute');
        popup.setStyle('top', pos.y);
        popup.setStyle('left', pos.x);
        popup.setStyle('width', dims.x);
        popup.setStyle('height', dims.y);
        popup.setStyle('background', 'rgba(0,0,0,0.5)');
        popup.inject(body);
        popup.set('html', html);

        var editorDiv = popup.getElement("#weemeeEditor");
        var height = (dims.x * 0.8) * 0.356;
        var editor = initEditor(dims.x * 0.8, height, updateWeeMee);
        editor.show();

        (function() {
          editorDiv.setStyle("position", "absolute");
          editorDiv.setStyle("left", dims.x * 0.1);
          editorDiv.setStyle("top", (dims.y - height) * 0.5);

          var cancel = new Element("div", {'class': 'cancel'});
          cancel.set('html', "<a href='#'>Cancel and Exit</a>");
          cancel.inject(popup);
          cancel.setStyle("top", ((dims.y - height) * 0.5) + height);
          cancel.setStyle("left", dims.x * 0.1);
          cancel.setStyle('position', 'absolute');
          cancel.setStyle('padding', '1.2rem');
          cancel.setStyle('background', '#fff');
          cancel.setStyle('font-size', '1.4rem');
          cancel.setStyle('margin', '1rem 0');
          cancel.setStyle('color', '#000');

          cancel.getElement("a").addEvent("click", function(ev) {
              new Event(ev).stop( );
              popup.dispose();
          });
        }).delay(600);
      }
    });
    request.send();
  }

  $('editWeeMeeBttn').addEvent('click', function(e) {
    e.preventDefault();
    displayEditor();
  });

})();

