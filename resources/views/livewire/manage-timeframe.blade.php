<div>
    <div class="staffcontainer mx-auto bg-secondary w-full shadow-xl p-10 ">
        <div class="overflow-y-auto max-h-[380px]">
            <table id="timeframesTable" class="table-auto w-full text-center bg-white rounded-lg shadow-lg">
                <thead class="sticky top-0 bg-primary text-highlight z-10 text-white">
                    <tr>
                        <th class="px-4 py-2 text-sm text-white">Timefrmae</th>
                        <th class="px-4 py-2 text-sm text-white">Percentage Cost</th>
                        <th class="px-4 py-2 text-sm text-white">Maximum Orders</th>
                        <th class="px-4 py-2 text-sm text-white">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($timeframes as $timeframeID => $timeframe)
                    <tr class="border-b border-gray-300 text-white hover:bg-accent transition-all duration-200 hover:text-white" data-timeframe-id="{{ $timeframeID }}">
                        <td class="px-4 py-2">
                            <input type="text"
                                wire:model="timeframes.{{ $timeframeID }}.delivery_timeframe"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="x weeks"
                                pattern="^\d+ weeks$"
                                title="Please enter the timeframe in the format 'x weeks', where x is a number."
                                wire:keydown.enter="updateTimeframe({{ $timeframe->timeframeID }})"
                                wire:blur="updateTimeframe({{ $timeframe->timeframeID }})">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number"
                                wire:model="timeframes.{{ $timeframeID }}.percentageCost"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="{{ $timeframe->percentageCost }}"
                                step="0.01"
                                wire:keydown.enter="updateTimeframe({{ $timeframe->timeframeID }})"
                                wire:blur="updateTimeframe({{ $timeframe->timeframeID }})">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number"
                                wire:model="timeframes.{{ $timeframeID }}.maximum_orders"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="{{ $timeframe->maximum_orders }}"
                                step="1"
                                wire:keydown.enter="updateTimeframe({{ $timeframe->timeframeID }})"
                                wire:blur="updateTimeframe({{ $timeframe->timeframeID }})">
                        </td>
                        <td class="px-4 py-2">
                            <button wire:click="updateTimeframe({{ $timeframe->timeframeID }})" class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700 transition">
                                <i class="fa fa-save w-5 h-5"></i>
                            </button>
                            <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                                wire:click="$emit('confirmDeleteTimeframe', {{ $timeframeID }}, '{{ $timeframe['delivery_timeframe'] }}')">
                                <i class="fa fa-trash w-5 h-5"></i>
                            </button>
                        </td>
                    </tr>
                    @endforeach
                    <tr>
                        <td colspan="4" class="px-4 py-2">
                            <button wire:click="showTimeframeModal" id="showAddTimeframeButton" class="bg-primary text-white py-2 px-6 rounded hover:bg-green-500 transition">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </td>
                    </tr>

                    {{-- Archived Timeframe Section --}}
                    @if (count($archivedTimeframes) > 0)
                    <tr class="bg-gray-200 text-gray-700 font-bold">
                        <td colspan="4">Archived Timeframes</td>
                    </tr>
                    @foreach ($archivedTimeframes as $timeframeID => $timeframe)
                    <tr class="border-b border-gray-300 text-black hover:bg-accent transition-all duration-200 hover:text-white">
                        <td class="px-4 py-2">{{ $timeframe->delivery_timeframe }}</td>
                        <td class="px-4 py-2">{{ $timeframe->percentageCost }}</td>
                        <td class="px-4 py-2">{{ $timeframe->maximum_orders }}</td>
                        <td class="px-4 py-2">
                            <span class="text-gray-500">Archived</span>
                        </td>
                    </tr>
                    @endforeach
                    @endif
                </tbody>
            </table>
        </div>
    </div>
</div>