function oc_update_price(min) {
    min = parseInt(min);
    var curval = parseInt($('.oc-qty input[name="quantity"]').val());
    if(curval >= min){
        oc_update();
    } else {
        $('.oc-qty input[name="quantity"]').val(min);
    }
}
function oc_popup(product_id) {
    $.magnificPopupNew.open({
        tLoading: '<img src="catalog/view/javascript/oneclick/loading.gif" alt="Loading..." />',
        items: {
            src: 'index.php?route=extension/module/oneclick&prod_id='+product_id,
            type: 'ajax'
        },
        callbacks: {
            ajaxContentAdded: function() {
              $('.oc input[name="quantity"]').on('change', function(){
                if($(this).val() > 0){
                    oc_update();
                }
              });
            },
            open: function() {
              $.magnificPopupNew.instance.close = function() {
                $.ajax({url:'index.php?route=checkout/cart/oc_clear_cart'})
                $.magnificPopupNew.proto.close.call(this);
              };
            }
        }
    });
}
function oc_submit(){
    $.ajax({
        async: true,
        cache: false,
        url: 'index.php?route=extension/module/oneclick/confirm',
        type: 'post',
        data: $('.oc-body input[type=\'hidden\'], .oc-body input[type=\'text\'], .oc-body input[type=\'tel\'], .oc-body input[type=\'radio\']:checked, .oc-body input[type=\'checkbox\']:checked, .oc-body select, .oc-body textarea, .oc-footer input[type=\'checkbox\']:checked'),
        dataType: 'json',
        beforeSend: function() {
            $('#oc_submit').text(oc_params['order_button_text_loading']);
        },
        success: function(json) {
            $('.oc-form-group').removeClass('has-error');
            $('.oc-error').remove();
            if(json['error']){
                if(json['error']['firstname']){
                    oc_error('firstname', json['error']['firstname']);
                }
                if(json['error']['lastname']){
                    oc_error('lastname', json['error']['lastname']);
                }
                if(json['error']['telephone']){
                    oc_error('telephone', json['error']['telephone']);
                }
                if(json['error']['email']){
                    oc_error('email', json['error']['email']);
                }
                if(json['error']['address_1']){
                    oc_error('address_1', json['error']['address_1']);
                }
                if(json['error']['comment']){
                    oc_error('comment', json['error']['comment']);
                }
                if(json['error']['agree']){
                    $('.oc-footer p label').after('<br /><span class="oc-error">'+json['error']['agree']+'</span>');
                }
                if (json['error']['option']) {
                    for (i in json['error']['option']) {
                        var element = $('#oc-option-' + i.replace('_', '-'));

                        if (element.parent().hasClass('input-group')) {
                            element.parent().after('<div class="oc-error">' + json['error']['option'][i] + '</div>');
                        } else {
                            element.after('<div class="oc-error">' + json['error']['option'][i] + '</div>');
                        }
                    }
                }
            }
            if(json['success']){
                $('.oc-body').html(json['success']);
                $('#oc_submit').replaceWith('<button class="btn btn-danger pull-right" onclick="$.magnificPopupNew.close(); return true;">'+oc_params['close_button_text']+'</button>');
                
            }else{
                $('#oc_submit').text(oc_params['order_button_text']);
            }
        }
    });
}
function oc_error(field, error){
    $('.oc-' + field).addClass('has-error');
    $('.oc-' + field + ' input,.oc-' + field + ' textarea').after('<span class="oc-error">'+error+'</span>');
}
function oc_update(){
    $.ajax({
        async: true,
        cache: false,
        url: 'index.php?route=extension/module/oneclick/update',
        type: 'post',
        data: $('.oc-body input[type=\'hidden\'], .oc-body input[type=\'text\'], .oc-body input[type=\'tel\'], .oc-body input[type=\'radio\']:checked, .oc-body input[type=\'checkbox\']:checked, .oc-body select, .oc-body textarea'),
        dataType: 'json',
        beforeSend: function() {
            $('#increase_quantity,#decrease_quantity').prop('disabled',true);
        },
        complete: function() {
            $('#increase_quantity,#decrease_quantity').prop('disabled',false);
        },
        success: function(json) {
            if(json['total']){
                $('.oc-total span').text(json['total']);
            }
            if(json['special'] && json['price']){
                $('.oc-price span').remove();
                $('.oc-price').prepend('<span class="oc-special">' + json['price'] + '</span> <span>' + json['special'] + '</span>');
            }else if(json['price']){
                $('.oc-price span').remove();
                $('.oc-price').prepend('<span>' + json['price'] + '</span>');
            }
        }
    });
}
function oc_descr(){
    if($('.oc-show-descr').hasClass('oc-hide')){
        $('.oc-description').slideUp('fast', function(){
            $('.oc-show-descr').text(oc_params['descr_show_text']).removeClass('oc-hide');
        });
    }else{
        $('.oc-description').slideDown('fast', function(){
            $('.oc-show-descr').text(oc_params['descr_hide_text']).addClass('oc-hide');
        });
    }
}
function oc_set_main_image(src, obj){
    $('.oc-main-image img').attr('src', src);
    $('.oc-thumbs img').removeClass('active');
    obj.addClass('active');
}
function updateocButtons(oc_params){
    if(typeof(oc_params) != 'undefined'){
        if(oc_params['show_in_cat']){                    
            $.each(oc_params['list_btns'], function(key, btn_params){
                if(typeof($(btn_params['list_product_block'])) !== 'undefined'){
                    if(btn_params['list_position'] == 1){
                        $.each($(btn_params['list_product_block']), function() {
                          var product_id = $(this).find("[onclick^='"+oc_params['list_selector']+"']").attr('onclick').match(/[0-9]+/);
                          $(this).find(btn_params['list_element']).before('<div class="'+btn_params['list_btn_block_class']+'"><button class="'+btn_params['list_btn_class']+'">'+oc_params['button_text']+'</button></div>').prev().attr('onclick', 'oc_popup(\'' + product_id + '\');');
                        });
                    }else if(btn_params['list_position'] == 2){
                        $.each($(btn_params['list_product_block']), function() {
                          var product_id = $(this).find("[onclick^='"+oc_params['list_selector']+"']").attr('onclick').match(/[0-9]+/);
                          if(!$(this).find(btn_params['list_element'] + ' + ' + btn_params['list_btn_block_class']).length){
                                $(this).closest(btn_params['list_product_block']).find(btn_params['list_element']).after('<div class="'+btn_params['list_btn_block_class']+'"><button class="'+btn_params['list_btn_class']+'">'+oc_params['button_text']+'</button></div>').next().attr('onclick', 'oc_popup(\'' + product_id + '\');');
                          }
                        });
                    }
                }
            });
        }
        if(oc_params['show_in_prod']){
            if(typeof($('input[name=\'product_id\']')) !== 'undefined'){
                if(oc_params['product_position'] == 1){
                    $(oc_params['product_element']).before('<div class="'+oc_params['product_btn_block_class']+'"><button class="'+oc_params['product_btn_class']+'">'+oc_params['button_text']+'</button></div>').prev().attr('onclick', 'oc_popup(\'' + $('input[name=\'product_id\']').val() + '\');');
                } else if(oc_params['product_position'] == 2){
                    $(oc_params['product_element']).after('<div class="'+oc_params['product_btn_block_class']+'"><button class="'+oc_params['product_btn_class']+'">'+oc_params['button_text']+'</button></div>').next().attr('onclick', 'oc_popup(\'' + $('input[name=\'product_id\']').val() + '\');');
                }
            }
        }
    }
    console.log('oc update');
}
$(function() {
    updateocButtons(oc_params);
});

(function(b,f,i){function l(){b(this).find(c).each(j)}function m(a){for(var a=a.attributes,b={},c=/^jQuery\d+/,e=0;e<a.length;e++)if(a[e].specified&&!c.test(a[e].name))b[a[e].name]=a[e].value;return b}function j(){var a=b(this),d;a.is(":password")||(a.data("password")?(d=a.next().show().focus(),b("label[for="+a.attr("id")+"]").attr("for",d.attr("id")),a.remove()):a.realVal()==a.attr("placeholder")&&(a.val(""),a.removeClass("placeholder")))}function k(){var a=b(this),d,c;placeholder=a.attr("placeholder");
b.trim(a.val()).length>0||(a.is(":password")?(c=a.attr("id")+"-clone",d=b("<input/>").attr(b.extend(m(this),{type:"text",value:placeholder,"data-password":1,id:c})).addClass("placeholder"),a.before(d).hide(),b("label[for="+a.attr("id")+"]").attr("for",c)):(a.val(placeholder),a.addClass("placeholder")))}var g="placeholder"in f.createElement("input"),h="placeholder"in f.createElement("textarea"),c=":input[placeholder]";b.placeholder={input:g,textarea:h};!i&&g&&h?b.fn.placeholder=function(){}:(!i&&g&&
!h&&(c="textarea[placeholder]"),b.fn.realVal=b.fn.val,b.fn.val=function(){var a=b(this),d;if(arguments.length>0)return a.realVal.apply(this,arguments);d=a.realVal();a=a.attr("placeholder");return d==a?"":d},b.fn.placeholder=function(){this.filter(c).each(k);return this},b(function(a){var b=a(f);b.on("submit","form",l);b.on("focus",c,j);b.on("blur",c,k);a(c).placeholder()}))})(jQuery,document,window.debug);