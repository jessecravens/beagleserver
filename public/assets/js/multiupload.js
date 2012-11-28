
// check for browser support - use Modernizr
// check for properly formatted config obj
// dragover, drop event support
// check that listeners were defined
// firing of callbacks - change, dragover, drop, submit
// _read()
// _dropFiles()
// validation within _validate
// blob creation witihin _uploader
// _unique call
// ajax within _uploader
// icon creation within _preview
// recursive call within _uploader
// ajax response

function multiUploader(config){
  
	this.config = config;
	this.items = "";
	this.all = []
	var self = this;
	
	multiUploader.prototype._init = function(){
		console.log("_init")
		if (window.File && 
			window.FileReader && 
			window.FileList && 
			window.Blob) {		
			 var inputId = $("#"+this.config.form).find("input[type='file']").eq(0).attr("id");
			 document.getElementById(inputId).addEventListener("change", this._read, false);
			 document.getElementById(this.config.dragArea).addEventListener("dragover", function(e){ e.stopPropagation(); e.preventDefault(); }, false);
			 document.getElementById(this.config.dragArea).addEventListener("drop", this._dropFiles, false);
			 document.getElementById(this.config.form).addEventListener("submit", this._submit, false);
		} else
			console.log("Browser supports failed");
	}
	
	multiUploader.prototype._submit = function(e){
		console.log("_submit")
		e.stopPropagation(); e.preventDefault();
		self._startUpload();
	}
	
	multiUploader.prototype._preview = function(data){
		console.log("_preview")
		this.items = data;
		if(this.items.length > 0){
			var html = "";		
			var uId = "";
 			for(var i = 0; i<this.items.length; i++){
				uId = this.items[i].name._unique();
				var sampleIcon = '<img src="assets/img/image.png" />';
				var errorClass = "";
				if(typeof this.items[i] != undefined){
					if(self._validate(this.items[i].type) <= 0) {
						sampleIcon = '<img src="assets/img/unknown.png" />';
						errorClass =" invalid";
					} 
					html += '<div class="dfiles'+errorClass+'" rel="'+uId+'"><h5>'+sampleIcon+this.items[i].name+'</h5><div id="'+uId+'" class="progress-icon" style="display:none;"><img src="assets/img/ajax-loader.gif" /></div></div>';
				}
			}
			$("#dragAndDropFiles").append(html);
		}
	}

	multiUploader.prototype._read = function(evt){
		console.log("_read")
		if(evt.target.files){
			self._preview(evt.target.files);
			self.all.push(evt.target.files);
		} else 
			console.log("Failed file reading");
	}
	
	multiUploader.prototype._validate = function(format){
		console.log("_validate")
		var arr = this.config.support.split(",");
		return arr.indexOf(format);
	}
	
	multiUploader.prototype._dropFiles = function(e){
		console.log("_dropFiles")
		e.stopPropagation(); e.preventDefault();
		self._preview(e.dataTransfer.files);
		self.all.push(e.dataTransfer.files);
	}

	// XMLHttpRequest Level 2 adds support for the new FormData interface.
	// FormData objects provide a way to easily construct a set of key/value pairs representing form fields and their values, 
	// which can then be easily sent using the XMLHttpRequest send() method.
	// It uses the same format a form would use if the encoding type were set to "multipart/form-data".
	
	multiUploader.prototype._uploader = function(file,f){
		console.log("_uploader")
		if(typeof file[f] != undefined && self._validate(file[f].type) > 0){
			
			var data = new FormData();
			var ids = file[f].name._unique();
			
			data.append('file',file[f]);
			data.append('index',ids);
			console.log("FormData: " , data)

			$(".dfiles[rel='"+ids+"']").find(".progress-icon").show();
			$.ajax({
				type:"POST",
				url:this.config.uploadUrl,
				data:data,
				cache: false,
				contentType: false,
				processData: false,
				success:function(rponse){
					
					console.log("RESPONSE: " , rponse);
					//console.log($(".dfiles[rel='"+ids+"']"));
					$(".dfiles[rel='"+ids+"']").fadeOut('slow',function(){
						$(".dfiles[rel='"+ids+"']").hide();
						$(".dfiles[rel='"+ids+"']").after("<img src='assets/img/check.png' style='display: block; margin: 5px'/>");
					});
					
					var obj = $(".dfiles").get();
					$.each(obj,function(k,fle){
						if($(fle).attr("rel") == rponse){
							$(fle).slideUp("normal", function(){ $(this).remove(); });
						}
					});
					if (f+1 < file.length) {
						self._uploader(file,f+1);
					}
				}
			});
		} else
			console.log("Invalid file format - "+file[f].name);
	}
	
	multiUploader.prototype._startUpload = function(){
		console.log("_startUpload")
		if(this.all.length > 0){
			for(var k=0; k<this.all.length; k++){
				var file = this.all[k];
				this._uploader(file,0);
			}
		}
	}
	
	String.prototype._unique = function(){
		console.log("_unique")
		return this.replace(/[a-zA-Z]/g, function(c){
     	   return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
    	});
	}

	this._init();
}

function initMultiUploader(){
	new multiUploader(config);	
}