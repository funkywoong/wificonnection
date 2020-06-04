define(['require','base/js/namespace','base/js/dialog','jquery'],function(requirejs, IPython, dialog, $){

    // we will define an action here that should happen when we ask to clear and restart the kernel.
    var search_wifi  = {
        help: 'wifi',
        icon : 'fa-wifi',
        help_index : '',
        handler : function (env) {
            $('<link />').attr({
                rel: 'stylesheet',
                type: 'text/css',
                href: requirejs.toUrl('./main.css')
            }).appendTo('head')
            var wifiDiv = $('<div class="wifi"/>')
            var wifiConnectDiv = `<div class="wifi-connect">
                                 <div class="wifi-title">
                                    <span class="tit-wifi">Wifi</span>
                                    <span class="txt-status">No internet connection</span>
                                 </div>
                                 <a href="javascript:;" class="toggle-wrap">
                                    <span class="toggle-bar"></span>
                                    <span class="toggle-thumb"></span>
                                 </a>
                                 <img class="progress" rel="stylesheet" type="text/css" src="/nbextensions/wificonnection/progress.svg">
                                 <a href="javascript:;" class="btn-retry">
                                    <img class="retry" src="/nbextensions/wificonnection/retry.svg" rel="styleshhet" type="text/css">
                                 </a> 
                               </div>`

            var listModal = dialog
            
            
            
            
            var settings = {
            url : '/wifi/scan',
            processData : false,
            type : "GET",
            dataType: "json",
            contentType: 'application/json',
            success: function(data) {
                var currentWifi = '';
                if(data.statusText === "interface off"){
                    console.log("off")
                    $('.txt-status').removeClass("active").text("No internet connection")
                    $('.progress').css("display", "none")
                    $('.btn-retry').css("display", "none")
                } else {
                    console.log("on")
                    $('.txt-status').addClass("active").text("wifi is connecting")
                    $('.toggle-wrap').addClass('active')
                    $('.progress').css("display", "block")
                    $('.btn-retry').css("display", "block")
                    data.current_wifi_data.forEach(function(v){
                        addList(v.SSID,v.PSK,v.SIGNAL,v.STATUS)
                        currentWifi = v.SSID
                    })
                    data.whole_wifi_data.forEach(function(v){
                        addList(v.SSID,v.PSK,v.SIGNAL,v.STATUS, currentWifi)
                    })
                }
                console.log(data)
            },
            error: function(data) {
                // if(testData.statusText !== "interface off"){
                //     $('.progress').css("display", "none")
                //     $('.btn-retry').css("display", "none")
                // } else {
                //     testData.current_wifi_data.forEach(function(v){
                //         addList(v.ssid)
                //     })
                //     testData.whole_wifi_data.forEach(function(v){
                //         addList(v.ssid)
                //     })
                //     $('.toggle-wrap').addClass('active')
                //     $('.progress').css("display", "block")
                // }
            }

            };
            var payload = {
                'SSID' : "",
                'PSK' : "",
                'KNOWN_HOST' : true
            }

            wifiDiv.append(wifiConnectDiv)


            var wifiListUl = $('<ul class="wifi-list"/>')
            function addList(name, psk, signal, status=false, currentWifi='') {
                var signalLevel = 0;
                var wifiListItem = "";
                if(signal > -20) {
                    signalLevel = 4
                } else if( -20 > signal >= -30) {
                    signalLevel = 3
                } else if( -30 > signal >= -40) {
                    signalLevel = 2
                } else if( -40 > signal >= -50) {
                    signalLevel = 1
                } else if( -50 > signal) {
                    signalLevel = 0
                }

                function current (state) {
                    return state === true ?`<img class="wifi-current" src="/nbextensions/wificonnection/selected.svg" rel="stylesheet" type="text/css" />` : ""
                }

                function private (private) {
                    return private === "PSK" ? `<img class="wifi-private" src="/nbextensions/wificonnection/lock.svg" rel="stylesheet" type="text/css"></img>` : ""
                }
                console.log("name", name)
                console.log("current", currentWifi)
                name !== currentWifi ? 
                wifiListItem = `<li class="wifi-item">
                                      <a href="javascript:;" class="btn-wifi">
                                        <span class="wifi-name">${name}</span>` + current(status)
                                         + private(psk) +
                                        `<img class="wifi-strength" src="/nbextensions/wificonnection/wifi-${signalLevel}.svg" rel="stylesheet" type="text/css">
                                      </a>
                                    </li>` : null
                wifiListUl.append(wifiListItem)
                $('.progress').css("display", "none")
                wifiDiv.append(wifiListUl)
            }

            function resetList() {
                $('.wifi-list').remove()
            }

            $(document).on('click', '.toggle-wrap', function(){
                if($(this).hasClass('active')){
                    $('.progress').css("display", "none")
                    $('.btn-retry').css("display", "none")
                    $('.txt-status').removeClass("active").text("No internet connection")
                    $(this).removeClass('active')
                    resetList()
                }else {
                    $('.progress').css("display", "block")
                    $('.btn-retry').css("display", "block")
                    $('.txt-status').addClass("active").text("wifi is connecting")
                    $(this).addClass('active')
                    wifiListUl = $('<ul class="wifi-list"/>')
                    $.ajax(settings);
                }
            })

            $(document).on('click', '.btn-wifi', function(){
                var targetName = $(this).find(".wifi-name").text()

                var wifiPrivate = !!($(this).find(".wifi-private").length)
                payload.SSID = targetName
                $('.modal-backdrop').remove()
                $('.wifi').parent().parent().parent().parent().remove()
                var modalTitle = `<div class="tit-wrap">
                                    <a href="javascript:;" class="btn-back">
                                    <img class="back" src="/nbextensions/wificonnection/icon-back.svg" rel="stylesheet" type="text/css" style="display: block;" />
                                    </a>
                                    <div class="tit-input">Input password</div>
                                  </div>`

                var passwordDiv = `<div class="password-box">
                                     <p class="tit-password">WiFi "${targetName}" is required password.</p>
                                     <div class="password-wrap visibilty">
                                        <input class="inp-password" type="password" placeholder="Input password">
                                        <a href="javascript:;" class="btn-visibility">
                                          <img class="password-visibility active" src="/nbextensions/wificonnection/innvisibility.svg" rel="stylesheet" type="text/css"/>
                                        </a>
                                        <a href="javascript:;" class="btn-connect">connect</a>
                                        <span class="txt-invalid"> Invalid password. please try again</span>
                                        <img class="connect-progress" rel="stylesheet" type="text/css" src="/nbextensions/wificonnection/progress.svg">
                                      </div>
                                      <label class="chk-remeber">Remeber this network
                                      <input type="checkbox" checked="checked"/>
                                      <span class="checkmark"></span>
                                    </label>
                                   </div>`
                var modalHeaderDiv = $('<div/>')
                var modalBodyDiv = $('<div class="psd-box"/>')

                modalHeaderDiv.append(modalTitle)
                modalBodyDiv.append(passwordDiv)

                dialog.modal({
                    body: modalBodyDiv ,
                    title: 'Input password',
                    dialogClass: 'test',
                    // buttons: {'Commit and Push':
                    //             { class:'btn-primary btn-large',
                    //               click:on_ok
                    //             },
                    //           'Cancel':{}
                    //     },
                    notebook:env.notebook,
                    keyboard_manager: env.notebook.keyboard_manager,
                })
            })

            $(document).on('click', '.btn-visibility', function() {
                if($(this).parent().hasClass('visibilty')){
                    $(this).parent().removeClass('visibilty')
                    $(this).parent().find('input').attr('type', 'text')
                    $(this).parent().find('.password-visibility').attr('src',"/nbextensions/wificonnection/visibility.svg")
                } else {
                    $(this).parent().addClass('visibilty')
                    $(this).parent().find('input').attr('type', 'password')
                    $(this).parent().find('.password-visibility').attr('src',"/nbextensions/wificonnection/innvisibility.svg")
                }
            })

            $(document).on('click', '.btn-connect', function(){
                $('.connect-progress').css("display","block")
                payload.PSK = $('.inp-password').val()
                console.log(payload)                
                var settingSettings = {
                    url : '/wifi/setting',
                    processData : false,
                    type : "PUT",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    contentType: 'application/json',
                    success: function(data) {
                        $('.connect-progress').css("display","none")
                        $('.password-wrap').remove()
                        $('.chk-remeber').remove()
                        $('.tit-password').text(`WiFi ${payload.SSID} is connected`)
                        $('.modal-title').text("WiFi")
                        setTimeout(() => {
                            $('.modal-backdrop').remove()
                            $('.modal').remove()
                        }, 3000);
                        console.log('come')
                        console.log(data)
                    },
                    error: function(data) {
                    }
    
                };
                $.ajax(settingSettings);
            })

            $.ajax(settings);

            var listModalOption = {
                body: wifiDiv ,
                title: 'Wifi list',
                notebook:env.notebook,
                keyboard_manager: env.notebook.keyboard_manager,
            }
            
            listModal.modal(listModalOption)


        }
    }

    function _on_load(){

        // log to console
        console.info('wifis')

        // register new action
        var action_name = IPython.keyboard_manager.actions.register(search_wifi, 'search wifi list')

        // add button for new action
        IPython.toolbar.add_buttons_group([action_name])

    }

    return {load_ipython_extension: _on_load };
})

