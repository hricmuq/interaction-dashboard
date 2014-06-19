<div id="actionDiv" class="centered">
	<button id="updateBtn">Update</button>
	
    <!--
	<div id="exportDiv">
		<select id="exportCharts">
			<option value="">Export Charts</option>
			<option value="1">Export option 1</option>
			<option value="2">Export option 2</option>
		</select>
	</div>
    -->
    <button id="exportCharts">Export</button>
</div>

<div id="aggregatedDataSection">
	<div class="aggregatedDataTitle">
		Statistics
	</div>
	<div class="aggregatedDataSeriesContainer">
		<!--
		<div class="aggregatedDataSeries">
			<div class="aggregatedSeriesTitle">
				Series 1
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">10000</div>
				<div class="aggregatedDataCaption">Total queries</div>
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">1340</div>
				<div class="aggregatedDataCaption">Interactions</div>
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">3.2</div>
				<div class="aggregatedDataCaption">Average queries per interaction</div>
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">86</div>
				<div class="aggregatedDataCaption">Average characters per query</div>
			</div>
		</div>
		
		<div class="aggregatedDataSeries">
			<div class="aggregatedSeriesTitle">
				Series 2
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">10000</div>
				<div class="aggregatedDataCaption">Total queries</div>
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">1340</div>
				<div class="aggregatedDataCaption">Interactions</div>
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">3.2</div>
				<div class="aggregatedDataCaption">Average queries per interaction</div>
			</div>
			<div class="aggregatedData">
				<div class="aggregatedDataValue">86</div>
				<div class="aggregatedDataCaption">Average characters per query</div>
			</div>
		</div>
		-->
	</div>
</div>

<div class="chartBox">
	<select id="addChart">
		<option value="">Add Chart</option>
		<option value="langchart">Language Chart</option>
		<option value="qtypechart">Query Type Chart</option>
		<option value="topquerychart">Top Query Chart</option>
        <option value="iduration">Interaction Duration</option>
        <option value="interactionfrequencychart">Interaction Frequency Diagram</option>
        <option value="weekheatmap">Heat Map</option>
        <?php if( viewGet() == "comparison" ): ?>
        <option value="topquerycomparisonchart">Top Query Comparison Chart</option>
        <?php endif ?>
	</select>
</div>
