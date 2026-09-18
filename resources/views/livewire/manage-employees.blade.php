<div>
    <h1 class="text-4xl text-highlight font-extrabold mb-6">Manage Employees</h1>

    <div class="staffcontainer mx-auto bg-secondary w-full shadow-xl p-10">
        <table id="employeesTable" class="table-auto w-full text-center bg-white rounded-lg shadow-lg">
            <thead class="sticky top-0 bg-primary text-highlight z-10 text-white">
                <tr>
                    <th class="px-4 py-2 text-sm text-white">Name</th>
                    <th class="px-4 py-2 text-sm text-white">Gender</th>
                    <th class="px-4 py-2 text-sm text-white">Email</th>
                    <th class="px-4 py-2 text-sm text-white">Birthday</th>
                    <th class="px-4 py-2 text-sm text-white">Address</th>
                    <th class="px-4 py-2 text-sm text-white">Contact</th>
                    <th class="px-4 py-2 text-sm text-white">Actions</th>
                </tr>
            </thead>
            <tbody>
                {{-- Active Employees --}}
                @foreach ($activeEmployees as $employee)
                <tr class="border-b border-gray-300 text-black hover:bg-accent transition-all duration-200 hover:text-white" data-employee-id="{{ $employee->user_id }}">
                    <td class="px-4 py-2">{{ $employee->first_name }} {{ $employee->last_name }}</td>
                    <td class="px-4 py-2">{{ ucfirst($employee->sex) }}</td>
                    <td class="px-4 py-2">{{ $employee->email }}</td>
                    <td class="px-4 py-2">{{ \Carbon\Carbon::parse($employee->bday)->format('F, d Y') }}</td>
                    <td class="px-4 py-2">{{ $employee->address }}</td>
                    <td class="px-4 py-2">{{ $employee->contact }}</td>
                    <td class="px-4 py-2">
                        <button wire:click="$emit('showEditEmployeeForm', {{ $employee->user_id }})" class="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-700 transition">
                            <!-- Edit Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                        </button>
                        <button class="archiveEmployeeButton bg-red-500 text-white py-1 px-3 rounded hover:bg-red-700 transition">
                            <!-- Archive Icon (using trash icon here) -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v2H9V4a1 1 0 011-1z" />
                            </svg>
                        </button>
                    </td>
                </tr>
                @endforeach

                {{-- Archived Employees Section --}}
                @if ($archivedEmployees->isNotEmpty())
                <tr class="bg-gray-200 text-gray-700 font-bold">
                    <td colspan="7">Archived Employees</td>
                </tr>
                @foreach ($archivedEmployees as $employee)
                <tr class="border-b border-gray-300 text-black hover:bg-accent transition-all duration-200 hover:text-white">
                    <td class="px-4 py-2">{{ $employee->first_name }} {{ $employee->last_name }}</td>
                    <td class="px-4 py-2">{{ ucfirst($employee->sex) }}</td>
                    <td class="px-4 py-2">{{ $employee->email }}</td>
                    <td class="px-4 py-2">{{ \Carbon\Carbon::parse($employee->bday)->format('F, d Y') }}</td>
                    <td class="px-4 py-2">{{ $employee->address }}</td>
                    <td class="px-4 py-2">{{ $employee->contact }}</td>
                    <td class="px-4 py-2">
                        <span class="text-gray-500">Archived</span>
                    </td>
                </tr>
                @endforeach
                @endif
            </tbody>

            {{-- Add Employee Button Row --}}
            <tr id="addEmployeeRow">
                <td colspan="7" class="px-4 py-4">
                    <div class="flex justify-center items-center h-full">
                        <button id="showAddEmployeeButton" class="bg-primary text-white py-2 px-6 rounded hover:bg-green-500 transition">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </td>
            </tr>

        </table>
    </div>
</div>