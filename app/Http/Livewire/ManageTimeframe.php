<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Log;
use Livewire\Component;

use App\Models\Timeframe;

class ManageTimeframe extends Component
{
    public $timeframes;
    public $archivedTimeframes;

    protected $rules = [
        'timeframes.*.delivery_timeframe' => ['required', 'regex:/^\d+ weeks$/'],
        'timeframes.*.percentageCost' => 'required|numeric',
        'timeframes.*.maximum_orders' => 'required|numeric',
    ];

    protected $listeners = [
        'createTimeframe' => 'createTimeframe',
        'archiveTimeframe' => 'archiveTimeframe',
        'updateTimeframe' => 'callUpdateTimeframe'
    ];

    public function mount()
    {
        Log::info('mount() called');
        $this->timeframes = Timeframe::all();
        $this->archivedTimeframes = Timeframe::where('archived', true)->get();
        if (!$this->archivedTimeframes) {
            $this->archivedTimeframes = [];
        }
    }

    public function updateTimeframe($timeframeID)
    {
        Log::info('updateTimeframe() called', ['timeframeID' => $timeframeID]);
        $timeframe = Timeframe::find($timeframeID);

        if ($timeframe) {
            // Find the correct timeframe in the array
            $foundTimeframe = null;
            foreach ($this->timeframes as $key => $tf) {
                if ($tf['timeframeID'] == $timeframeID) {
                    $foundTimeframe = $tf;
                    break;
                }
            }

            if ($foundTimeframe) {
                Log::info('Updating timeframe', [
                    'timeframeID' => $timeframeID,
                    'delivery_timeframe' => $foundTimeframe['delivery_timeframe'],
                    'percentageCost' => $foundTimeframe['percentageCost'],
                    'maximum_orders' => $foundTimeframe['maximum_orders'],
                ]);
                $timeframe->delivery_timeframe = $foundTimeframe['delivery_timeframe'];
                $timeframe->percentageCost = $foundTimeframe['percentageCost'];
                $timeframe->maximum_orders = $foundTimeframe['maximum_orders'];
                $timeframe->save();
            } else {
                Log::error('Timeframe not found in array', ['timeframeID' => $timeframeID]);
                session()->flash('error', 'Timeframe not found in array.');
                return;
            }

            session()->flash('message', 'Timeframe Updated.');
            $this->timeframes = Timeframe::all();
            $this->emit('timeframeUpdated');
        } else {
            session()->flash('error', 'Timeframe not found.');
        }
    }


    public $newTimeframe = ['delivery_timeframe' => '', 'cost' => '', 'maximum_orders' => ''];

    public function addTimeframe()
    {
        Log::info('addTimeframe() called');
        $this->validate([
            'newTimeframe.delivery_timeframe' => 'required',
            'newTimeframe.percentageCost' => 'required|numeric',
            'newTimeframe.maximum_orders' => 'required|numeric',
        ]);

        Timeframe::create([
            'delivery_timeframe' => $this->newTimeframe['delivery_timeframe'],
            'percentageCost' => $this->newTimeframe['percentageCost'],
            'maximum_orders' => $this->newTimeframe['maximum_orders'],
        ]);

        $this->timeframes = Timeframe::all();
        $this->newTimeframe = ['delivery_timeframe' => '', 'percentageCost' => '', 'maximum_orders' => ''];
        session()->flash('message', 'Timeframe Added.');
    }

    public function showTimeframeModal()
    {
        \Illuminate\Support\Facades\Log::info('showTimeframeModal called');
        $this->emit('showTimeframeModal');
    }


    public function archiveTimeframe($timeframeID)
    {
        $timeframe = Timeframe::find($timeframeID);

        if (!$timeframe) {
            session()->flash('error', 'Timeframe not found.');
            return;
        }

        $timeframe->archived = 1;
        $timeframe->save();

        \Illuminate\Support\Facades\Log::info('Timeframe Archived', ['timeframeID' => $timeframeID]);
        $this->timeframes = Timeframe::all();
        $this->emit('timeframeArchived');
    }

    public function render()
    {
        return view('livewire.manage-timeframe', [
            'timeframes' => $this->timeframes,
            'archivedTimeframes' => $this->archivedTimeframes,
        ]);
    }

    public function callUpdateTimeframe($timeframeID)
    {
        $this->updateTimeframe($timeframeID);
    }
}
