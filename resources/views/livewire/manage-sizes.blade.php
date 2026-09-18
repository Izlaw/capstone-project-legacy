<div>
    <!-- <h1 class="text-4xl text-highlight font-extrabold mb-6">Manage Sizes</h1> -->

    <div class="staffcontainer mx-auto bg-secondary w-full shadow-xl p-10 ">
        <div class="overflow-y-auto max-h-[380px]">
            <table id="sizesTable" class="table-auto w-full text-center bg-white rounded-lg shadow-lg">
                <thead class="sticky top-0 bg-primary text-highlight z-10 text-white">
                    <tr>
                        <th class="px-4 py-2 text-sm text-white">Name</th>
                        <th class="px-4 py-2 text-sm text-white">Price</th>
                        <th class="px-4 py-2 text-sm text-white">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {{-- Active Sizes --}}
                    @foreach ($sizes as $sizeID => $size)
                    <tr class="border-b border-gray-300 text-white hover:bg-accent transition-all duration-200 hover:text-white" data-size-id="{{ $sizeID }}">
                        <td class="px-4 py-2">
                            <input type="text"
                                wire:model="sizes.{{ $sizeID }}.sizeName"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="{{ $size['sizeName'] }}"
                                wire:keydown.enter="updateSize({{ $sizeID }})">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number"
                                wire:model="sizes.{{ $sizeID }}.price"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="{{ $size['sizePrice'] }}"
                                step="0.01"
                                wire:keydown.enter="updateSize({{ $sizeID }})">
                        </td>
                        <td class="px-4 py-2">
                            <button wire:click="updateSize({{ $sizeID }})" class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700 transition">
                                <i class="fa fa-save w-5 h-5"></i>
                            </button>
                            <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                                wire:click="$emit('confirmDeleteSize', {{ $sizeID }}, '{{ $size['sizeName'] }}')">
                                <i class="fa fa-trash w-5 h-5"></i>
                            </button>
                        </td>
                    </tr>
                    @endforeach

                    <tr id="addSizeRow">
                        <td colspan="3" class="px-4 py-4">
                            <div class="flex justify-center items-center h-full">
                                <button id="showAddSizeButton" class="bg-primary text-white py-2 px-6 rounded hover:bg-green-500 transition">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                    {{-- Archived Sizes Section --}}
                    @if (count($archivedSizes) > 0)
                    <tr class="bg-gray-200 text-gray-700 font-bold">
                        <td colspan="3">Archived Sizes</td>
                    </tr>
                    @foreach ($archivedSizes as $sizeID => $size)
                    <tr class="border-b border-gray-300 text-black hover:bg-accent transition-all duration-200 hover:text-white">
                        <td class="px-4 py-2">{{ $size['sizeName'] }}</td>
                        <td class="px-4 py-2">{{ $size['sizePrice'] }}</td>
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