<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator; // Import Validator
use Illuminate\Validation\ValidationException;

class ManageEmployees extends Component
{
    public $first_name, $last_name, $email, $password, $password_confirmation, $sex, $bday, $contact, $address;
    public $isAddEmployeeFormOpen = false;
    public $isEditEmployeeFormOpen = false;
    public $employeeIdBeingEdited;

    protected $listeners = [
        'addEmployee',
        'editEmployee',
        'deleteEmployee',
        'showEditEmployeeForm',
        'archiveEmployee'
    ]; // Added archiveEmployee to listeners

    // Render the view with employees
    public function render()
    {
        $activeEmployees = User::where('role', 'employee')
            ->where('archived', false)
            ->get();
        $archivedEmployees = User::where('role', 'employee')
            ->where('archived', true)
            ->get();

        return view('livewire.manage-employees', compact('activeEmployees', 'archivedEmployees'));
    }


    // Show form to add a new employee
    public function showAddEmployeeForm()
    {
        $this->reset(['first_name', 'last_name', 'email', 'password', 'password_confirmation', 'sex', 'bday', 'contact', 'address']);
        $this->isAddEmployeeFormOpen = true;
    }

    // Close the Add Employee form
    public function closeAddEmployeeForm()
    {
        $this->isAddEmployeeFormOpen = false;
    }

    public function showEditEmployeeForm($employeeId)
    {
        $employee = User::where('user_id', $employeeId)->firstOrFail();
        $this->employeeIdBeingEdited = $employeeId;
        $this->first_name = $employee->first_name;
        $this->last_name = $employee->last_name;
        $this->email = $employee->email;
        $this->sex = $employee->sex;
        $this->bday = $employee->bday;
        $this->contact = $employee->contact;
        $this->address = $employee->address;
        $this->isEditEmployeeFormOpen = true;

        $this->dispatchBrowserEvent('show-edit-employee-form', ['employee' => [
            'id' => $employee->user_id,
            'first_name' => $employee->first_name,
            'last_name' => $employee->last_name,
            'email' => $employee->email,
            'sex' => $employee->sex,
            'bday' => $employee->bday,
            'contact' => $employee->contact,
            'address' => $employee->address,
        ]]);
    }


    // Close the Edit Employee form
    public function closeEditEmployeeForm()
    {
        $this->isEditEmployeeFormOpen = false;
    }

    // Add a new employee
    public function addEmployee($formData)
    {
        try {
            // Check if email, contact, or address already exists
            $emailExists = User::where('email', $formData['email'])->exists();
            $contactExists = User::where('contact', $formData['contact'])->exists();
            $addressExists = User::where('address', $formData['address'])->exists();

            if ($emailExists) {
                $this->emit('employeeAddedError', 'Email is already in use!');
                return;
            }

            if ($contactExists) {
                $this->emit('employeeAddedError', 'Contact is already in use!');
                return;
            }

            if ($addressExists) {
                $this->emit('employeeAddedError', 'Address is already in use!');
                return;
            }

            $validatedData = Validator::make($formData, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'sex' => 'required|string|max:10',
                'bday' => 'required|date',
                'contact' => 'required|string|max:15',
                'address' => 'required|string|max:255',
            ])->validate();

            User::create([
                'first_name' => $validatedData['first_name'],
                'last_name' => $validatedData['last_name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'sex' => $validatedData['sex'],
                'bday' => $validatedData['bday'],
                'contact' => $validatedData['contact'],
                'address' => $validatedData['address'],
                'role' => 'employee',
            ]);

            $this->closeAddEmployeeForm();
            session()->flash('message', 'Employee added successfully.');
            $this->emit('employeeAdded');
        } catch (\Exception $e) {
            $this->emit('employeeAddedError', $e->getMessage());
        }
    }

    // Edit an existing employee
    public function editEmployee($formData)
    {
        try {
            // Find the employee being edited
            $employee = User::where('user_id', $this->employeeIdBeingEdited)->firstOrFail();

            // Only validate email uniqueness if it's changed
            if ($formData['email'] !== $employee->email) {
                $emailExists = User::where('email', $formData['email'])->exists();
                if ($emailExists) {
                    $this->emit('employeeEditError', 'Email is already in use.');
                    return;
                }
            }

            // Only validate contact uniqueness if it's changed
            if ($formData['contact'] !== $employee->contact) {
                $contactExists = User::where('contact', $formData['contact'])->exists();
                if ($contactExists) {
                    $this->emit('employeeEditError', 'Contact is already in use.');
                    return;
                }
            }

            // Basic validation without uniqueness checks
            $validatedData = Validator::make($formData, [
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255',
                'sex' => 'required|string|max:10',
                'bday' => 'required|date',
                'contact' => 'required|string|max:15',
                'address' => 'required|string|max:255',
            ])->validate();

            $employee->update($validatedData);

            $this->closeEditEmployeeForm();
            session()->flash('message', 'Employee updated successfully.');
            $this->emit('employeeUpdated');
        } catch (\Exception $e) {
            $this->emit('employeeEditError', $e->getMessage());
        }
    }

    public function archiveEmployee($id)
    {
        try {
            // Add debugging
            Log::info('Archiving employee with ID: ' . $id);

            // Find the user by primary key (user_id)
            $user = User::where('user_id', $id)->first();

            if (!$user) {
                Log::error('Employee not found with ID: ' . $id);
                session()->flash('error', 'Employee not found.');
                return;
            }

            // Check that the user is an employee before archiving
            if ($user->role === 'employee') {
                // Explicitly set the archived column to true
                $updated = $user->update(['archived' => true]);

                // Log the result of the update operation
                Log::info('Update result: ' . ($updated ? 'success' : 'failed'));

                session()->flash('message', 'Employee archived successfully.');
                $this->emit('employeeArchived');
            } else {
                Log::warning('Attempted to archive non-employee user: ' . $id);
                session()->flash('error', 'Only employees can be archived.');
            }
        } catch (\Exception $e) {
            Log::error('Failed to archive employee: ' . $e->getMessage());
            session()->flash('error', 'Failed to archive employee: ' . $e->getMessage());
        }
    }

    // Delete an employee
    public function deleteEmployee($employeeId)
    {
        $employee = User::findOrFail($employeeId);
        $employee->delete();

        session()->flash('message', 'Employee deleted successfully.');
    }
}
