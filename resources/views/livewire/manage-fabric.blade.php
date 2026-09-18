<div>
    <div class="staffcontainer mx-auto bg-secondary w-full shadow-xl p-10 ">
        <div class="overflow-y-auto max-h-[380px]">
            <table id="fabricsTable" class="table-auto w-full text-center bg-white rounded-lg shadow-lg">
                <thead class="sticky top-0 bg-primary text-highlight z-10 text-white">
                    <tr>
                        <th class="px-4 py-2 text-sm text-white">Name</th>
                        <th class="px-4 py-2 text-sm text-white">Price</th>
                        <th class="px-4 py-2 text-sm text-white">Action</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($fabrics as $fabric)
                    <tr class="border-b border-gray-300 text-white hover:bg-accent transition-all duration-200 hover:text-white" data-fabric-id="{{ $fabric->fabricID }}">
                        <td class="px-4 py-2">
                            <input type="text"
                                wire:model.defer="fabrics.{{ $loop->index }}.fabricName"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="{{ $fabric->fabricName }}"
                                wire:keydown.enter="updateFabric({{ $fabric->fabricID }})">
                        </td>
                        <td class="px-4 py-2">
                            <input type="number"
                                wire:model.defer="fabrics.{{ $loop->index }}.fabricPrice"
                                class="text-center bg-accent border border-highlight rounded-lg py-2 px-4 placeholder-white group-hover:bg-white group-hover:placeholder-black placeholder-opacity-100 focus:placeholder-gray-500"
                                placeholder="{{ $fabric->fabricPrice }}"
                                wire:keydown.enter="updateFabric({{ $fabric->fabricID }})">
                        </td>
                        <td class="px-4 py-2">
                            <button wire:click="updateFabric({{ $fabric->fabricID }})" class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700 transition">
                                <i class="fa fa-save w-5 h-5"></i>
                            </button>
                            <button class="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 transition"
                                wire:click="$emit('confirmDeleteFabric', {{ $fabric->fabricID }}, '{{ $fabric->fabricName }}')">
                                <i class="fa fa-trash w-5 h-5"></i>
                            </button>
                        </td>
                    </tr>
                    @endforeach
                    <tr>
                        <td colspan="3" class="px-4 py-2">
                            <button wire:click="showFabricModal" id="showAddFabricButton" class="bg-primary text-white py-2 px-6 rounded hover:bg-green-500 transition">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </td>
                    </tr>

                    {{-- Archived Fabrics Section --}}
                    @if (count($archivedFabrics) > 0)
                    <tr class="bg-gray-200 text-gray-700 font-bold">
                        <td colspan="3">Archived Fabrics</td>
                    </tr>
                    @foreach ($archivedFabrics as $fabric)
                    <tr class="border-b border-gray-300 text-black hover:bg-accent transition-all duration-200 hover:text-white">
                        <td class="px-4 py-2">{{ $fabric->fabricName }}</td>
                        <td class="px-4 py-2">{{ $fabric->fabricPrice }}</td>
                        <td class="px-4 py-2">
                            <span class="text-gray-500">Archived</span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif
        </tbody>
        <tfoot>

        </tfoot>
        </table>
    </div>
</div>


</div>