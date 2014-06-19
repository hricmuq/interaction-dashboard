<div>
	<fieldset>
		<legend>Filters:</legend>
		
		<div class="filtersDiv">
			<div class="languagesFilter boxFiltersContainer">
				<div class="filterTitle">Languages</div>
				<!--
					<label><input type="checkbox"/>English</label><br/>
					<label><input type="checkbox"/>Arabic</label><br/>
					<label><input type="checkbox"/>Arabified</label>
				-->
			</div>
			<div class="responseTypeFilter boxFiltersContainer">
				<div class="filterTitle">Response Types</div>
				<label><input type="checkbox" checked="checked" value="proper" name="response[]"/>Proper Response</label><br/>
				<label><input type="checkbox" checked="checked" value="missed" name="response[]"/>Missed Response</label>
			</div>
			<div class="queryTypeFilter boxFiltersContainer">
				<div class="filterTitle">Query Types</div>
				<!--
				<div class="queryTypeFilterColumn">
					<label><input type="checkbox"/>General</label><br/>
					<label><input type="checkbox"/>Meta(Language Selection...)</label><br/>
					<label><input type="checkbox"/>Direction</label>
				</div>
				<div class="queryTypeFilterColumn">
					<label><input type="checkbox"/>Weather</label><br/>
					<label><input type="checkbox"/>Translation</label>
				</div>
				-->
			</div>
			<div class="querySearchFilter boxFiltersContainer">
				<div class="filterTitle">Query contains</div>
				<input type="text" name="query_contains" class="stringSearchInput"/>
				<label><input type="checkbox" name="query_regex"/>Regex</label><br/>
				
				<div class="filterTitle">Response contains</div>
				<input type="text" class="stringSearchInput" name="response_contains"/>
				<label><input type="checkbox" name="response_regex"/>Regex</label>
			</div>
			
			<?php if( viewGet() == "interaction" ): ?>
			<div class="interactionDurationFilter boxFiltersContainer">
				<div id="durationFilterLabel">Interaction Duration (queries)</div><br/>
				<label><input type="checkbox" id="allInteractions" checked="checked"/>All Interaction Durations</label><br/>
				<div id="durationFilterContainer">
					<span class="interactionDurationFilterLabel">Min duration</span>
					<input type="text" id="min_duration" value="0" readonly="readonly" disabled="disabled"/>
					<div id="slider_range"></div>
					<input type="text" id="max_duration" value="12" readonly="readonly" disabled="disabled"/>
					<span class="interactionDurationFilterLabel">Max Duration</span>
					<br class="clear"/>
				</div>
			</div>
			
			<?php endif ?>
		</div>
	</fieldset>	
</div>