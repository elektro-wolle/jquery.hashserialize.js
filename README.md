jquery.hashserialize.js
=======================

Simple history-manager for AJAX-based web applications

Usage:

	$(function() {
		var ajaxState = {};
		$.restoreFromHash(function(state) {
			$("#target").html(state["caption"]);
		});
		$("#event").click(function() {
			var title = "Test äüß№ç ”“Í " + Math.random(100);
			ajaxState["caption"] = title;
			$.serializeToHash(ajaxState);
			$("#target").html(title);
		});
	});
