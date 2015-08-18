; (function ($) { 
    $.fn.extend({
        ETDonutChart: function (options) {
            options = $.extend({}, $.ETDonutChart.defaults, options);
            return this.each(function () {
            	$(this).data($.ETDonutChart.defaults.pluginName)
                if (!$.data(this, $.ETDonutChart.defaults.pluginName)) {
                    $.data(this, $.ETDonutChart.defaults.pluginName, new $.ETDonutChart(this, options));
                }
            });
            options = null;
        }
    });

    $.ETDonutChart = function (input, options) {
        if (arguments.length === 1 && typeof arguments[0] == "string") {
            return $.data(document.getElementById(arguments[0]), $.ETDonutChart.defaults.pluginName);
        }

/*******************************
* 參數設定                     *
*******************************/
			
        var self = this;			            
        var $input = $(input);
		    var currentArc= 0, currentArc2= 0, currentValue=0;
		    var arcObj = [];
		    var round = Math.ceil(options.value / options.maxValue) === 0 ? 1 : Math.ceil(options.value / options.maxValue);
		    var selection = d3.select(input);
		    var margin = {top:0, right:0, bottom:30, left:0};
		    var label;
		    var circle;
		    var background;
		    var svg;
		    var svgBlock;
		    self.input = input;

/*******************************
* 檢查                         *
*******************************/
			// 上面垂直線的高度
    		var topInfoLineHeight;
			if (options.topInfo){
				topInfoLineHeight = options.topInfoLineArea.height;
			} else {
				topInfoLineHeight = 0;
			}

			if (options.topInfoLineArea){
			    if (typeof(options.topInfoLineArea) !== "object" || ($.isArray(options.topInfoLineArea))){
			    	throw "topInfoLineArea 應為物件";
		    	}
		    	if (options.topInfoLineArea.height === undefined || options.topInfoLineArea.width  === undefined){
		    		throw "請傳入線條長寬";
		    	}
		    }
		    if (options.topInfoWordPosition){
			    if (typeof(options.topInfoWordPosition) !== "object" || ($.isArray(options.topInfoWordPosition))){
			    	throw "topInfoWordPosition 應為物件";
		    	}
		    	if (options.topInfoWordPosition.top  === undefined || options.topInfoWordPosition.left  === undefined){
		    		throw "請傳入字的 Top and Left";
		    	}
		    }


/*****************************************************************
* 如果有responsive 設計，則不用傳進來的高寬，使用DIV設定的高寬。 *
*****************************************************************/
        if (options.responsive){
	    	if (options.topInfo){
	    		if ($input.height() === 0){
	    			options.height = $input.width();  //  
	    			options.width = $input.width();
	    		} else {
	    			options.height = $input.height();
	    			options.width = $input.height();
	    		}
	    		
	    	} else {
	    		if ($input.height() === 0){
	    			options.height = $input.width();  //  - options.topInfoLineArea.height
	    			options.width = $input.width();
	    		} else {
	    			options.height = $input.height();
	    			options.width = $input.height();
	    		}
	    		
	    	}
	    }
	    	// 如果有上面資訊則會調整圓的寬高 
	    if (options.topInfo){
	    	margin.top = options.topInfoLineArea.height;
	    	options.height = options.height + margin.top;
	    }


/*******************************
* private funciton             *
*******************************/
			
        	// 畫出 Arc
		    var makeArc = function(){
		    	
		    	for (i = 0; i < round; i++){
		    		if (i == (round - 1)){
		    			arcObj[i] = d3.svg.arc().startAngle(0 * (Math.PI/180)).endAngle(0);
		    		} else {
		    			arcObj[i] = d3.svg.arc().startAngle(0 * (Math.PI/180));
		    		}
		    	}
		    }

		    // 設定路徑的寬度
		    var measure = function() {
		        var _width = options.diameter - margin.right - margin.left - margin.top - margin.bottom;
		        var _height = 0;

		        $.each(arcObj, function(i){
					arcObj[i].outerRadius(options.width/2 );
					arcObj[i].innerRadius(options.width/2 * (1 - options.radiusMultiple));
		        });

		        

		        //_arc.outerRadius(_width/2);
		        //_arc.innerRadius(_width/2 * .85);
		        //_arc2.outerRadius(_width/2);
		        //_arc2.innerRadius(_width/2 * .85);
		    }

		    // 第一圈動畫
	 	 	var arcTween = function(a) {
		        var i = d3.interpolate(currentArc, a);

		        return function(t) {
		            currentArc=i(t);
		            return arcObj[0].endAngle(i(t))();
		        };
		    }

		    // 第二圈以後動畫
		    var arcTween2 = function(a) {
		        var i = d3.interpolate(currentArc2, a);

		        return function(t) {
		            return arcObj[0].endAngle(i(t))();
		        };
		    }

		    // innerText 動畫
		    var labelTween = function(a) {

		        var i = d3.interpolate(currentValue, a);
		        var num = a.toString().split('.')[1];
		        var digit;
		        currentValue = i(0);
		        if (num === undefined) {
		            digit = 0;
		        } else {
		            digit = num.length;
		        }
		        return function(t) {
		            currentValue = i(t);
		            this.textContent = i(t).toFixed(digit) + options.Unit;
		            if (currentValue == options.value) {

                       
                        if (options.subInnerText) {
                            var labely = options.width / 2 + options.subInnerTextFontsize / 3;
                            var color;
                            if (options.subInnerTextColor) {
                                color = options.subInnerTextColor;
                            } else {
                                color = options.insideWordColor;
                            }

			                svgBlock.append("g").attr("class", "innerLabels");
			                var innerLabel = svg.selectAll(".innerLabels");
			                var innerLabelText = innerLabel.append("text")
			                .text(options.subInnerText)
                            .attr("font-size", options.subInnerTextFontsize)
                            .attr("y", labely + 30)
			                .attr("x", options.width / 2)
			                .attr("fill", color)
                            .attr("text-anchor", "middle");

			                innerLabelText.append("animate")
                            .attr("attributeType", "CSS")
                            .attr("attributeName", "opacity")
                            .attr("from", "0")
                            .attr("to", "1")
                            .attr("dur", "4s")
                            .attr("repeatCount", "1")
                            
			            }

		            	if (typeof options.endAnimation === "function"){
		            	    options.endAnimation();
				    	}
		            }
		        }

		    }

		    // 漸層 function
		    var Gradient = function(svg, GObj){

				var gradientOption;
				var gradientType;
		    	var gradientObj = {
		    		"none" : { "index": 0, "postion": {"x1": "0", "y1": "0", "x2": "0", "y2": "0"}},
		    		"TopToBottom" : { "index": 2 , "postion": {"x1": "0", "y1": "100%", "x2": "0", "y2": "0"}},
		    		"BottomToTop" : { "index": 2 , "postion": {"x1": "0", "y1": "0", "x2": "0", "y2": "100%"}},
		    		"LeftToRight" : { "index": 2 , "postion": {"x1": "100%", "y1": "0", "x2": "0", "y2": "0"}},
		    		"RightToLeft" : { "index": 2 , "postion": {"x1": "0", "y1": "0", "x2": "100%", "y2": "0"}},
		    		"LefttopToRightbottom" : { "index": 2 , "postion": {"x1": "100%", "y1": "100%", "x2": "0", "y2": "0"}},
		    		"LeftbottomToRighttop" : { "index": 2 , "postion": {"x1": "100%", "y1": "0", "x2": "0", "y2": "100%"}},
		    		"RightbottomToLefttop" : { "index": 2, "postion": {"x1": "0", "y1": "0", "x2": "100%", "y2": "100%"}},
		    		"RighttopToLeftbottom" : { "index": 2 , "postion": {"x1": "0", "y1": "100%", "x2": "100%", "y2": "0"}},
		    		"circle" : { "index": 3 , "postion": {"x1": "50%", "y1": "50%"}}
		    	}
		    	

		    	if (!gradientObj[options.gradientDirection]){
		    		throw "無此漸層方式";
		    	} else {
		    		gradientOption = gradientObj[options.gradientDirection].postion;
		    		gradientType = gradientObj[options.gradientDirection].index;
		    	}

		    	if ((typeof(options.gradientSetting) !== "object") || ($.isArray(options.gradientSetting))){
		    		throw "漸層設定錯誤";
		    	} else {
					var size = 0, key;
					for (key in options.gradientSetting) {
					    if (options.gradientSetting.hasOwnProperty(key)) size++;
					}
					if (gradientType === 0 && size === 0) { 
						return; 
					} 
					if (size === 2){
						gradientType = 3;
						gradientOption = options.gradientSetting;
					} else if (size === 4){
						gradientType = 2;
						gradientOption = options.gradientSetting;
					} else if (size === 0){
					} else {
						throw "漸層設定錯誤，物件裡有 " + size + " 個欄位不符規定";
					}
		    	}



		    	if (gradientType === 0){
		    		return;
		    	} else if (gradientType === 3){
		    		var gradient = GObj.append("svg:defs")
						.append("svg:radialGradient")
					    .attr("id", "gradient")
					    .attr("cx", gradientOption.x1)
					    .attr("cy", gradientOption.y1)
					    .attr("spreadMethod", "pad");

					gradient.append("svg:stop")
					    .attr("offset", options.gradientpercent + "%")
					    .attr("stop-color", options.gradientColor.endColor)
					    .attr("stop-opacity", 1);

				    gradient.append("svg:stop")
					    .attr("offset", "95%")
					    .attr("stop-color", options.gradientColor.startColor)
					    .attr("stop-opacity", 1);

					
		    	} else if (gradientType === 2){
			    	var gradient = GObj.append("svg:defs")
						.append("svg:linearGradient")
					    .attr("id", "gradient")
					    .attr("x1", gradientOption.x1)
					    .attr("y1", gradientOption.y1)
					    .attr("x2", gradientOption.x2)
					    .attr("y2", gradientOption.y2)
					    .attr("spreadMethod", "pad");

					gradient.append("svg:stop")
					    .attr("offset", options.gradientpercent + "%")
					    .attr("stop-color", options.gradientColor.endColor)
					    .attr("stop-opacity", 1);

				    gradient.append("svg:stop")
					    .attr("offset", "100%")
					    .attr("stop-color", options.gradientColor.startColor)
					    .attr("stop-opacity", 1);

			    }
			    circle = GObj.append('circle')
				    .attr('cx', options.width / 2)
				    .attr('cy', options.height / 2 - topInfoLineHeight/ 2)
				    .attr('r', options.width/2 * (1 - options.radiusMultiple))
				    .attr('fill', 'url(#gradient)');  

		    }

		    // 產生 SVG Tag，並設定 Class 以及 Attribute
		    var component = function(){
		    	selection.each(function () {

		    		// 創立 svg block
		    		svg = d3.select(this).selectAll("svg").data([options.value]);

		    		// svg block 下 創立 <g> Tag
		    		svgBlock = svg.enter().append("svg")
		    		var enter = svgBlock.append("g");

		    		svgBlock.attr("viewBox", "0 0 " + options.width + " " + options.height );
		    		svg.attr("preserveAspectRatio", "xMidYMid");
				    if (options.responsive){
			    		svg.attr("width","100%");
                        svg.attr("height", $input.width() + options.topInfoLineArea.height);
		    			$(window).resize(function(){
		    				svg.attr("height", $input.width() + options.topInfoLineArea.height);
		    			});
			    	} else {
		    		 	svg.attr("width", options.width)
		    		 		.attr("height", options.height);
            		};

		    		
		    		// innertext 設定
		    		var innertext;
		    		
                        measure();

		    		// 先產生第一圈 (灰階)
		    		
    				// <g> Tag 下 創立 class="background" 的 rect
    				background = enter.append("g").attr("fill", options.defaultCircleColor)
		                //.on("click",onMouseClick);

		            // 產生 background 裡的元素
		            arcObj[0].endAngle(360 * (Math.PI/180));
					background.append("rect")
					    .attr("width", options.width)
					    .attr("height", options.height - margin.top)
					    .attr("fill-opacity", 0.01)
		            	.attr("fill" , "#FFF")
					background.append("path")
					    .attr("transform", "translate(" + options.width/2 + "," + options.width/2 + ")")
					    .attr("d",  arcObj[0]);

			    	/*
					background.append("text")
					    .attr("class", "label")
					    .attr("transform", "translate(" + options.width/2 + "," + (options.width) + ")")
					    .text(options._label);
					*/

					// 漸層
					Gradient(svg , background);
					var g = svg.select("g")
					    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

					// 開始畫圈
				    arcObj[0].endAngle(currentArc);
				    enter.append("g").attr("class", "arcs");

				    	var path = [];
				    	var colorlength = options.pathcolor.length;
				    	for (var i =0; i < arcObj.length; i ++){
				    		var m = i % colorlength
				    		path[i] = svg.select(".arcs").selectAll(".arc").data([options.value]);
				    		var a = path[i].enter().append("path")
				                .attr("class","arc" + i).attr("fill", options.pathcolor[m])
				                .attr("transform", "translate(" + options.width/2 + "," + options.width/2 + ")")
				    	}
			            /*
			            var path = svg.select(".arcs").selectAll(".arc").data([options.value]);
			            path.enter().append("path")
			                .attr("class","arc")
			                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
			                .attr("d", arcObj[0]);

			            //Another path in case we exceed 100%
			            var path2 = svg.select(".arcs").selectAll(".arc2").data([options.value]);
			            path2.enter().append("path")
			                .attr("class","arc2")
			                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
			                .attr("d", arcObj[1]);
						*/
                        
						// innerText 設定
			            enter.append("g").attr("class", "labels");
			            
			            if (options.innertext){
			            	innertext = options.innertext;
			            } else if (options.delay) {
			                innertext = "";
			            }
			            else {
			                innertext = options.value + options.Unit;
			            } 
                        
			            
			            if (options.subInnerText) {
			                var labely = options.width / 2 + options.fontSize / 3 - 10;
			            } else {
                            var labely = options.width / 2 + options.fontSize / 3
			            }


			            label = svg.select(".labels").selectAll(".label").data([options.value]);
			            label.enter().append("text")
			                .attr("y",labely)
			                .attr("x",options.width/2)
			                .attr("width",options.width)
			                .attr("font-size", options.fontSize + "px")
			                // .attr("x",(3*fontSize/2))
			                .text(innertext)
			                .attr("fill", options.insideWordColor)
                            .attr("text-anchor", "middle")
                            .attr("class", "ETDountChartInnerText")
			                // function (d) { return Math.round((options.value-options.minValue)/(options.maxValue-options.minValue)*100) + "%" }
			                //.on("click",onMouseClick);

			           	// % 轉換
			            if (options.innertextChangePercent){
			             	svg.on("mouseover" , function(){ 
				            	label.text( Math.round((options.value-options.minValue)/(options.maxValue-options.minValue)*100) + "%" ) 
				            }).on("mouseleave" , function(){ 
				            	label.text( innertext ) 
				            });
				        };
                        
                         // sub inner text

			            

			            //path[0].exit().transition().duration(500).attr("x",1000).remove();

			            // 畫出 top info 
			            if (options.topInfo){
				            svg.append("g").attr("class", "topInfo")
				            var topInfo = svg.selectAll(".topInfo");
				            topInfo.append("line")
				            		.attr("x1", options.width/2 ).attr("y1", 0).attr("x2", options.width/2).attr("y2", options.topInfoLineArea.height)
				            		.attr('stroke', options.topInfoLineColor)
				            		.attr('stroke-width', options.topInfoLineArea.width);

				            topInfo.append("text")
				            .attr("y",15 + options.topInfoWordPosition.top)
			                .attr("x",options.width/2 + 10 + options.topInfoWordPosition.left)
			                .attr("font-size", options.topInfoWordFontsize)
			                .text(options.maxValue + options.topUnit)
			                .attr("fill", options.topInfoWordColor)
			            };

		    	       
                        


		            	// 畫圈動畫
						var layout = function(svg) {

			                var ratio=(options.value-options.minValue)/(options.maxValue-options.minValue);
			                var endAngle=Math.min(360*ratio,360);
			                endAngle=endAngle * Math.PI/180;

			                path[0].datum(endAngle);
		                	path[0].transition().duration(options.duration)
		                    		.attrTween("d", arcTween);

			                for (var j =1; j < arcObj.length; j ++){
	                    		if (ratio > 1) {
	                    			path[j].datum(Math.min(360*(ratio-j),360) * Math.PI/180);
			                    	path[j].transition().delay(options.duration*j).duration(options.duration)
			                        .attrTween("d", arcTween2);
	                    		}

			                }
			                /*
			                path[0].datum(endAngle);
			                path[0].transition().duration(options.duration)
			                    .attrTween("d", arcTween);

			                if (ratio > 1) {
			                    path[1].datum(Math.min(360*(ratio-1),360) * Math.PI/180);
			                    path[1].transition().delay(options.duration).duration(options.duration)
			                        .attrTween("d", arcTween2);
			                }
			                */

						    // inner 文字動畫
			                var speed = options.duration;
			                if (options.pathAndNumberSpeed === "sync") {
                                speed = options.duration * (options.value/options.maxValue) * 1.5
			                }
			                if (!options.innertext){
				                label.datum(options.value);
				                label.transition().duration(speed)
				                    .tween("text",labelTween);
			                }

						}
						setTimeout(function () {
						    layout(svg);
						}, options.delay);

						
		    	});
		    }

	    	if (typeof options.beforeAnimation === "function"){
	    		options.beforeAnimation.call(self);
	    	}

		    makeArc();
			component();

			
			// start Transition Event
			


/*******************************
* Public Function              *
*******************************/		
            self.innerTextClickEvent = function(callback){
                if (typeof callback === "function"){
                    $input.find(".ETDountChartInnerText")
                        .attr("cursor", "pointer")
                        .on("mouseover", function () { $(this).attr("text-decoration", "underline") })
                        .on("mouseout", function () { $(this).attr("text-decoration", "none") })
                        .on("click", function () { callback(); });    
                }
            }
        }


/*******************************
* 設定物件的初始設定           *
*******************************/
    $.ETDonutChart.defaults = {
    	pluginName: "ETDonutChart",
		duration:1000,
		width: 150,
		height: 150,
		diameter: 15,
		fontSize:20,
		value:37,
        minValue:0,
        maxValue:30,
        defaultCircleColor: "#ddd",
        insideWordColor: "#000",
        pathcolor: ["#4cc5cd", "#39969c"],
        topInfo : false,
        topInfoLineArea : {height:25 , width:1 },
        topInfoLineColor : "#000",
        topInfoWordColor: "#000",
        topInfoWordFontsize:15,
        topInfoWordPosition: { left: 0, top: 0 },
        topUnit : "",
        Unit : "",
        innertext: "",
        subInnerText: "",
        subInnerTextColor: "",
        subInnerTextFontsize: 13,
        responsive : false,
        radiusMultiple : 0.2,
        gradientColor: { startColor: "#ffffff" , endColor : "#d4d4d4"},
        gradientpercent : 5,
        gradientDirection : "TopToBottom",
        gradientSetting : {},
        innertextChangePercent : false,
        beforeAnimation: null,
        endAnimation: null,
        delay: 0,
        pathAndNumberSpeed: "async"
    };
})(jQuery); // 傳入 Jquery 物件
