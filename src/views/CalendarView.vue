<template>
  <CContainer class="px-4 mt-4" fluid>
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-auto order-2 order-lg-1">
          <div class="mb-3">
            <div class="dropdown">
              <button class="btn-dropdown-custom btn-medium-custom dropdown-toggle" type="button"
                      id="dropdownMenuButton1"
                      data-bs-toggle="dropdown" aria-expanded="false">
                {{ $t('calendar.sidebar.new') }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="startNewEventFromScratch">
                    {{ $t('calendar.sidebar.newAppointment') }}
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" target="_blank" href="https://scheduler.asyncz.com/"
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin: 4px 0; padding: 10px 15px; transition: transform 0.2s ease; box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);"
                     onmouseover="this.style.transform='translateY(-1px)'"
                     onmouseout="this.style.transform='translateY(0)'">
                    {{ $t('calendar.sidebar.externalScheduler') }}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <SmallCalendar :value="currentDate" @calendarDayClick="calendarDayClick" />
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              {{ $t('calendar.sidebar.branchesExperts') }}
            </div>
            <ul class="list-group list-group-flush">
              <template v-for="b in expertMap" :key="b.branch.id">
                <li class="list-group-item list-group-item-dark">
                  <label :class="{ 'text-white': theme === 'dark' }">
                    <input
                      class="expert-colored-checkbox me-2"
                      type="checkbox"
                      @change="branchClicked(b.branch.id, $event)"
                      :checked="branchSelected[b.branch.id]"
                      :indeterminate="branchSelected[b.branch.id] === null"
                      aria-label="..."
                      :style="{'--expert-color': b.experts[0]?.color || '#387f94'}"
                    />
                    <strong>{{ b.branch.name }}</strong>
                  </label>
                </li>
                <li class="list-group-item ps-5" v-for="sh in b.experts" :key="sh.id">
                  <label :class="{ 'text-white': theme === 'dark' }">
                    <input
                      class="expert-colored-checkbox"
                      type="checkbox"
                      :value="sh.id"
                      v-model="selectedSchedules"
                      aria-label="..."
                      :style="{'--expert-color': sh.color}"
                    />
                    {{ sh.name }}
                  </label>
                </li>
              </template>
            </ul>
          </div>
        </div>

        <div class="col-md order-1 order-lg-2 p-0" id="calendarView">
          <div class="row justify-content-between mb-3">
            <div class="col-md col-6 order-2 order-md-1">
              <a href="#" class="btn btn-outline-secondary me-2" @click.prevent="goToToday">
                {{ $t('calendar.buttons.today') }}
              </a>
              <a href="#" class="btn btn-outline-secondary me-2" @click.prevent="prevView">
                <fa-icon :icon="['fas', 'chevron-left']" />
              </a>
              <a href="#" class="btn btn-outline-secondary ms-2" @click.prevent="nextView">
                <fa-icon :icon="['fas', 'chevron-right']" />
              </a>
            </div>

            <div class="col-md col-12 order-1 order-md-2 text-center">
              <h3>{{ calendarTitle }}</h3>
            </div>

            <div class="col-md col-6 order-3 order-md-3 text-end">
              <div class="dropdown">
                <button class="btn-dropdown-custom btn-dropdown-outline-custom dropdown-toggle" type="button"
                        id="dropdownMenuButton1"
                        data-bs-toggle="dropdown" aria-expanded="false">
                  {{ views[activeView].title }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                  <li v-for="(v,k) in views" :key="k">
                    <a class="dropdown-item" href="#" @click.prevent="activateView(k)">
                      {{ v.title }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="copyingAppointment">
            <div class="alert alert-warning">
              <div class="d-flex justify-content-between w-100">
                <div>
                  <strong>{{ $t('calendar.copyBanner.title') }}</strong><br>
                  <div class="small">
                    <strong>{{ $t('calendar.copyBanner.customer') }}:</strong>
                    <span>{{ copyingAppointment.name }} {{ copyingAppointment.surname }}</span><br>
                    <strong>{{ $t('calendar.copyBanner.phone') }}:</strong>
                    <span>{{ copyingAppointment.phone }}</span><br>
                    <strong>{{ $t('calendar.copyBanner.email') }}:</strong>
                    <span>{{ copyingAppointment.email }}</span><br>
                    <strong>{{ $t('calendar.copyBanner.procedure') }}:</strong>
                    <span>{{ copyingAppointment.procedure.name }}</span><br>
                    <strong>{{ $t('calendar.copyBanner.expert') }}:</strong>
                    <span>{{ copyingAppointment.expert.fullName }}</span><br>

                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="showAllExperts" id="flexCheckDefault">
                      <label class="form-check-label" for="flexCheckDefault">
                        {{ $t('calendar.copyBanner.copyToAnotherExpert') }}
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <a href="#" @click.prevent="copyingAppointment=null" class="text-secondary">
                    <fa-icon :icon="['fas','times']"></fa-icon>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div v-if="readyToBuildLayout">
            <CalendarVerticalLayout
              v-if="view===VIEW_VERTICAL"
              :current-date="currentDate"
              :start-date="startDate"
              :end-date="endDate"
              :day-count="dayCount"
              :options="options"
              :schedules="visibleSchedules"
              :events="visibleEvents"
              :blocks="visibleBlocks"
              :screen-width="screenWidth"
              :screen-height="screenHeight"
              @hourSlotClicked="showQuickActionModal"
              @hourSlotDropped="updateAppointmentTime"
              @dayClicked="openDayDailyView"
              @eventClicked="showAppointmentDetails"
              @appResized="updateAppointmentLength"
              @blockClicked="showBlockTimeDetails"
              @blockResized="updateBlockTimeLength"
            />

            <CalendarMonthLayout
              v-if="view===VIEW_MONTH"
              :current-date="currentDate"
              :start-date="startDate"
              :end-date="endDate"
              :day-count="dayCount"
              :options="options"
              :schedules="visibleSchedules"
              :events="visibleEvents"
              :screen-width="screenWidth"
              :screen-height="screenHeight"
              @dayClicked="openDayDailyView"
              @eventClicked="showAppointmentDetails"
            />
          </div>
        </div>
      </div>
    </div>
  </CContainer>

  <!-- Quick Action Modal -->
  <ModalComponent :title="$t('calendar.quickAction.title')" v-if="quickActionModalOpen" @modalClose="quickActionModalOpen = false" size="sm">
    <div class="text-center" style="max-width:320px; margin:0 auto;">
      <div>
        <div class="fw-bold">
          {{ quickActionDetails.time ? quickActionDetails.time.format('MMMM DD, YYYY - HH:mm') : '' }}
        </div>
        <div class="text-muted small">
          {{ quickActionDetails.expert ? quickActionDetails.expert.name : '' }}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <button class="btn-primary-custom" @click="selectAddAppointment" style="margin-bottom: 6px; padding-top: 4px; padding-bottom: 4px;">
          {{ $t('calendar.quickAction.new') }}
        </button>
        <button class="btn btn-light btn-medium-custom" @click="selectBlockTime" style="margin-top: 0; padding-top: 4px; padding-bottom: 4px; border: 1.5px solid #bcbcbc;">
          {{ $t('calendar.quickAction.blockTime') }}
        </button>
      </div>
    </div>
  </ModalComponent>

  <!-- Block Time Modal -->
  <ModalComponent :title="$t('calendar.blockTimeModal.title')" v-if="blockTimeModalOpen" @modalClose="blockTimeModalOpen = false" size="md">
    <form @submit.prevent="crateBlockTime" class="clean-form">
      <div class="form-field">
        <label>{{ $t('calendar.blockTimeModal.labels.expert') }}</label>
        <select v-model="blockTimeDetails.expert" required class="modern-input">
          <option value="">{{ $t('calendar.blockTimeModal.labels.chooseExpert') }}</option>
          <option v-for="expert in expertList" :key="expert.id" :value="expert.id">{{ expert.name }}</option>
        </select>
      </div>

      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.blockTimeModal.labels.date') }}</label>
          <input type="date" v-model="blockTimeDetails.date" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.blockTimeModal.labels.time') }}</label>
          <input type="time" v-model="blockTimeDetails.time" required class="modern-input" />
        </div>
      </div>

      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.blockTimeModal.labels.duration') }}</label>
          <input type="number" v-model="blockTimeDetails.duration" required class="modern-input" min="1" max="480" :placeholder="$t('calendar.blockTimeModal.labels.durationPlaceholder')" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.blockTimeModal.labels.reason') }}</label>
          <input type="text" v-model="blockTimeDetails.reason" required class="modern-input" :placeholder="$t('calendar.blockTimeModal.labels.reasonPlaceholder')" />
        </div>
      </div>

      <div class="form-actions" style="margin-top: 18px;">
        <button type="button" class="btn-cancel-custom" @click="blockTimeModalOpen = false">{{ $t('calendar.blockTimeModal.actions.cancel') }}</button>
        <button type="submit" class="btn-create-custom">{{ $t('calendar.blockTimeModal.actions.save') }}</button>
      </div>
    </form>
  </ModalComponent>

  <!-- New Appointment Modal -->
  <ModalComponent :title="$t('calendar.newAppointmentModal.title')" v-if="newAppointmentIsOpen" @modalClose="newAppointmentIsOpen = false">
    <form @submit.prevent="createNewAppointment" class="modern-body clean-form">
      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.expert') }} <span style="color:#e74c3c">*</span></label>
          <select v-model="newItemDetails.expert" required class="modern-input">
            <option value="">{{ $t('calendar.newAppointmentModal.labels.chooseExpert') }}</option>
            <option v-for="expert in expertList" :key="expert.id" :value="expert.id">{{ expert.name }}</option>
          </select>
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.service') }} <span style="color:#e74c3c">*</span></label>
          <select v-model="newItemDetails.procedure" required class="modern-input">
            <option value="">{{ $t('calendar.newAppointmentModal.labels.chooseService') }}</option>
            <option v-for="procedure in selectedExpertProcedureList" :key="procedure.id" :value="procedure.id">
              {{ procedure.name }} ({{ procedure.length }} {{ $t('calendar.newAppointmentModal.labels.min') }})
            </option>
          </select>
        </div>
      </div>

      <div class="form-row date-time-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.date') }} <span style="color:#e74c3c">*</span></label>
          <input type="date" v-model="newItemDetails.date" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.time') }} <span style="color:#e74c3c">*</span></label>
          <input type="time" v-model="newItemDetails.time" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.duration') }} <span style="color:#e74c3c">*</span></label>
          <div style="display: flex;">
            <input type="number" min="15" v-model="newItemDetails.length" required class="modern-input" style="flex:1;"/>
            <span class="date-time-row-span" style="align-self:center; margin-left:8px; font-size: 0.95em; color: var(--muted-foreground)">{{ $t('calendar.newAppointmentModal.labels.min') }}</span>
          </div>
        </div>
      </div>


      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.firstName') }} <span style="color:#e74c3c">*</span></label>
          <input type="text" v-model="newItemDetails.name" required class="modern-input" autocomplete="given-name" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.lastName') }} <span style="color:#e74c3c">*</span></label>
          <input type="text" v-model="newItemDetails.surname" required class="modern-input" autocomplete="family-name" />
        </div>
      </div>

      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.phone') }} <span style="color:#e74c3c">*</span></label>
          <input type="tel" v-model="newItemDetails.phone" required class="modern-input" autocomplete="tel" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.newAppointmentModal.labels.email') }}</label>
          <input type="email" v-model="newItemDetails.email" class="modern-input" autocomplete="email" />
          <div class="checkbox-wrapper" style="margin-top: 8px;">
            <input type="checkbox" id="sendEmail" v-model="newItemDetails.sendEmail" class="me-2" />
            <label for="sendEmail" style="font-size: 0.93em;">{{ $t('calendar.newAppointmentModal.labels.sendConfirmationEmail') }}</label>
          </div>
        </div>
      </div>

      <div class="form-field full-width">
        <label>{{ $t('calendar.newAppointmentModal.labels.additionalNotes') }}</label>
        <textarea v-model="newItemDetails.notes" class="modern-input" rows="2" :placeholder="$t('calendar.newAppointmentModal.labels.notesPlaceholder')"></textarea>
      </div>

      <div class="form-actions" style="margin-top: 18px;">
        <button type="button" class="btn-cancel-custom" @click="newAppointmentIsOpen = false">{{ $t('calendar.newAppointmentModal.actions.cancel') }}</button>
        <button type="submit" class="btn-create-custom">{{ $t('calendar.newAppointmentModal.actions.create') }}</button>
      </div>
    </form>
  </ModalComponent>

  <!-- Edit Appointment Modal -->
  <ModalComponent :title="$t('calendar.editAppointmentModal.title')" v-if="editingAppointment" @modalClose="editingAppointment = null">
    <form @submit.prevent="updateAppointment" class="modern-body clean-form">
      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.expert') }} <span style="color:#e74c3c">*</span></label>
          <select v-model="editingAppointment.expert.id" required class="modern-input">
            <option v-for="expert in expertList" :key="expert.id" :value="expert.id">{{ expert.name }}</option>
          </select>
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.procedure') }} <span style="color:#e74c3c">*</span></label>
          <select v-model="editingAppointment.procedure.id" required class="modern-input">
            <option v-for="procedure in selectedExpertProcedureListUpdate" :key="procedure.id" :value="procedure.id">
              {{ procedure.name }} ({{ procedure.length }} {{ $t('calendar.editAppointmentModal.labels.min') }})
            </option>
          </select>
        </div>
      </div>

      <div class="form-row date-time-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.date') }} <span style="color:#e74c3c">*</span></label>
          <input type="date" v-model="editingAppointment.date" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.time') }} <span style="color:#e74c3c">*</span></label>
          <input type="time" v-model="editingAppointment.time" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.length') }} <span style="color:#e74c3c">*</span></label>
          <div style="display: flex;">
            <input type="number" v-model="editingAppointment.reservationLength" required class="modern-input" style="flex:1;" />
            <span class="date-time-row-span" style="align-self:center; margin-left:8px; font-size: 0.95em; color: var(--muted-foreground)">{{ $t('calendar.editAppointmentModal.labels.min') }}</span>
          </div>
        </div>
      </div>

      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.firstName') }} <span style="color:#e74c3c">*</span></label>
          <input type="text" v-model="editingAppointment.name" required class="modern-input" autocomplete="given-name" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.lastName') }} <span style="color:#e74c3c">*</span></label>
          <input type="text" v-model="editingAppointment.surname" required class="modern-input" autocomplete="family-name" />
        </div>
      </div>

      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.phone') }} <span style="color:#e74c3c">*</span></label>
          <input type="text" v-model="editingAppointment.phone" required class="modern-input" autocomplete="tel" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editAppointmentModal.labels.email') }}</label>
          <input type="email" v-model="editingAppointment.email" class="modern-input" autocomplete="email" />
        </div>
      </div>

      <div class="form-field full-width">
        <label>{{ $t('calendar.editAppointmentModal.labels.notes') }}</label>
        <textarea v-model="editingAppointment.notes" class="modern-input" rows="2"></textarea>
      </div>

      <div class="form-actions" style="margin-top: 18px;">
        <button type="button" class="btn-cancel-custom" @click="editingAppointment = null">{{ $t('calendar.editAppointmentModal.actions.cancel') }}</button>
        <button type="submit" class="btn-success-custom">{{ $t('calendar.editAppointmentModal.actions.update') }}</button>
      </div>
    </form>
  </ModalComponent>

  <!-- Edit Block Time Modal -->
  <ModalComponent :title="$t('calendar.editBlockTimeModal.title')" v-if="editingBlockTime" @modalClose="editingBlockTime = null">
    <form @submit.prevent="updateBlockTime" class="modern-body clean-form">
      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editBlockTimeModal.labels.expert') }} <span style="color:#e74c3c">*</span></label>
          <select v-model="editingBlockTime.expert.id" required class="modern-input">
            <option v-for="expert in expertList" :key="expert.id" :value="expert.id">{{ expert.name }}</option>
          </select>
        </div>
      </div>

      <div class="form-row" style="gap:18px;">
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editBlockTimeModal.labels.date') }} <span style="color:#e74c3c">*</span></label>
          <input type="date" v-model="editingBlockTime.date" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editBlockTimeModal.labels.time') }} <span style="color:#e74c3c">*</span></label>
          <input type="time" v-model="editingBlockTime.time" required class="modern-input" />
        </div>
        <div class="form-field" style="flex:1;">
          <label>{{ $t('calendar.editBlockTimeModal.labels.length') }} <span style="color:#e74c3c">*</span></label>
          <div style="display: flex;">
            <input type="number" v-model="editingBlockTime.duration" required class="modern-input" style="flex:1;" />
            <span class="input-group-text" style="margin-left:8px; font-size: 0.95em; color: var(--muted-foreground)">{{ $t('calendar.editBlockTimeModal.labels.min') }}</span>
          </div>
        </div>
      </div>

      <div class="form-field full-width">
        <label>{{ $t('calendar.editBlockTimeModal.labels.comment') }}</label>
        <textarea v-model="editingBlockTime.comment" class="modern-input" rows="2"></textarea>
      </div>

      <div class="form-actions" style="margin-top: 18px;">
        <button type="button" class="btn-cancel-custom" @click="editingBlockTime = null">{{ $t('calendar.editBlockTimeModal.actions.cancel') }}</button>
        <button type="submit" class="btn-success-custom">{{ $t('calendar.editBlockTimeModal.actions.update') }}</button>
      </div>
    </form>
  </ModalComponent>

  <!-- Appointment Details Modal -->
  <ModalComponent :title="$t('calendar.appointmentDetails.title')" v-if="activeAppointment" @modalClose="activeAppointment = null">
    <div class="modern-body" style="padding-bottom: 8px;">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-6 mb-3">
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.expert') }}:</span><br />
            <strong>{{ activeAppointment.expert.fullName }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.procedure') }}:</span><br />
            <strong>{{ activeAppointment.procedure.name }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.starts') }}:</span><br />
            <strong>{{ formatTime(activeAppointment.reservationStartTime.date) }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.duration') }}:</span><br />
            <strong>{{ activeAppointment.reservationLength }} {{ $t('calendar.editAppointmentModal.labels.min') }}</strong>
            <span class="text-danger small" v-if="activeAppointment.reservationLength !== activeAppointment.procedure['length']">
              ({{ $t('calendar.appointmentDetails.labels.originally', { length: activeAppointment.procedure['length'] }) }})
            </span>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.status') }}:</span><br />
            <span class="badge bg-primary">{{ activeAppointment.status }}</span>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.customer') }}:</span><br />
            <strong>{{ activeAppointment.name }} {{ activeAppointment.surname }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.phone') }}:</span><br />
            <strong>{{ activeAppointment.phone }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.email') }}:</span><br />
            <strong>{{ activeAppointment.email }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.notes') }}:</span><br />
            <strong>{{ activeAppointment.notes || '-' }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.appointmentDetails.labels.requestedAt') }}:</span><br />
            <strong>{{ formatTime(activeAppointment.requestTime.date) }}</strong>
          </div>
        </div>
      </div>

      <div class="form-actions" style="margin-top:0; gap:10px;">
        <button class="btn-success-custom me-2" v-if="activeAppointment.status === 'new'" @click.prevent="confirmAppointment(activeAppointment)">
          <fa-icon :icon="['fas','check']" class="me-2"></fa-icon>
          {{ $t('calendar.appointmentDetails.actions.confirm') }}
        </button>
        <button class="btn-danger-custom me-2" v-if="activeAppointment.status === 'confirmed'" @click.prevent="cancelAppointment(activeAppointment)">
          <fa-icon :icon="['fas','times']" class="me-2"></fa-icon>
          {{ $t('calendar.appointmentDetails.actions.cancel') }}
        </button>
        <button class="btn-outline-warning-custom btn-size-small-custom me-2" @click.prevent="editAppointment(activeAppointment)">
          <fa-icon :icon="['fas','pencil']" class="me-2"></fa-icon>
          {{ $t('calendar.appointmentDetails.actions.edit') }}
        </button>
        <button class="btn-outline-info-custom btn-outline-primary-custom me-2" @click.prevent="copyAppointment(activeAppointment)">
          <fa-icon :icon="['fas','copy']" class="me-2"></fa-icon>
          {{ $t('calendar.appointmentDetails.actions.copy') }}
        </button>
        <button class="btn-outline-custom btn-outline-dark-custom" @click.prevent="printAppointment(activeAppointment)">
          <fa-icon :icon="['fas','print']" class="me-2"></fa-icon>
          {{ $t('calendar.appointmentDetails.actions.print') }}
        </button>
      </div>
    </div>
  </ModalComponent>

  <!-- Block time Details Modal -->
  <ModalComponent :title="$t('calendar.blockTimeDetails.title')" v-if="activeBlockTime" @modalClose="activeBlockTime = null">
    <div class="modern-body" style="padding-bottom: 8px;">
      <div class="row" style="margin-bottom:12px;">
        <div class="col-md-12 mb-3">
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.blockTimeDetails.labels.expert') }}:</span><br />
            <strong>{{ activeBlockTime.expert.fullName }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.blockTimeDetails.labels.starts') }}:</span><br />
            <strong>{{ formatTime(activeBlockTime.startTime.date) }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.blockTimeDetails.labels.duration') }}:</span><br />
            <strong>{{ activeBlockTime.duration }} {{ $t('calendar.editAppointmentModal.labels.min') }}</strong>
          </div>
          <div class="mb-1">
            <span class="small text-secondary">{{ $t('calendar.blockTimeDetails.labels.comment') }}:</span><br />
            <strong>{{ activeBlockTime.comment || '-' }}</strong>
          </div>
        </div>
      </div>
      <div class="form-actions" style="margin-top:0; gap:10px;">
        <button class="btn-danger-custom me-2" @click.prevent="deleteBlockTime(activeBlockTime)">
          <fa-icon :icon="['fas','times']" class="me-2"></fa-icon>
          {{ $t('calendar.blockTimeDetails.actions.delete') }}
        </button>
        <button class="btn-outline-warning-custom btn-size-small-custom me-2" @click.prevent="editBlockTime(activeBlockTime)">
          <fa-icon :icon="['fas','pencil']" class="me-2"></fa-icon>
          {{ $t('calendar.blockTimeDetails.actions.edit') }}
        </button>
      </div>
    </div>
  </ModalComponent>
</template>

<script>

import { getCalendarInfo, getSchedules } from '@/repositories/GeneralDataRepository.js'
import CalendarVerticalLayout from '@/components/calendar/layouts/CalendarVerticalLayout.vue'
import { VIEW_MONTH, VIEW_VERTICAL } from '@/Constants.js'
import { useAuthStore } from '@/stores/auth.js'
import { mapState } from 'pinia'
import { FontAwesomeIcon as FaIcon } from '@fortawesome/vue-fontawesome'
import CalendarMonthLayout from '@/components/calendar/layouts/CalendarMonthLayout.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { getProcedures } from '@/repositories/ProceduresRepository.js'
import {
  cancel,
  confirm,
  createAppointment,
  getAppointment,
  setLength,
  setTime,
  updateAppointment
} from '@/repositories/AppointmentRepository.js'
import SmallCalendar from '@/components/calendar/SmallCalendar.vue'
import { useThemeStore } from '@/stores/theme.js'
import { useSidebarStore } from '@/stores/sidebar.js'
import {
  createBlockTime, deleteTime,
  setLength as setBlockLength,
  setTime as setBlockTime,
  updateBlockTime
} from '@/repositories/BlockTimeRepository.js'
import { toast } from 'vue3-toastify'

export default {
  name: 'CalendarView',
  components: { SmallCalendar, ModalComponent, CalendarMonthLayout, FaIcon, CalendarVerticalLayout },
  data() {
    return {
      view: VIEW_MONTH, //horizontal, month, vertical
      dayCount: 7,
      dayStep: 7,
      startDate: null,
      currentDate: null,
      endDate: null,
      eventList: [],
      blockTimeList: [],
      screenWidth: 0,
      screenHeight: 0,
      minDate: null,
      maxDate: null,
      schedules: [],
      selectedSchedules: [],
      activeView: 'week',
      views: {
        day: {
          type: VIEW_VERTICAL,
          title: 'Day',
          dayCount: 1,
          dayStep: 1
        },
        day3: {
          type: VIEW_VERTICAL,
          title: '3 Days',
          dayCount: 3,
          dayStep: 3
        },
        week: {
          type: VIEW_VERTICAL,
          title: 'Week',
          dayCount: 7,
          dayStep: 7
        },
        month: {
          type: VIEW_MONTH,
          title: 'Month'
        }
      },

      procedures: [],
      quickActionModalOpen: false,
      quickActionDetails: {
        time: null,
        expert: null
      },

      // Block Time Modal
      blockTimeModalOpen: false,
      blockTimeDetails: {
        expert: '',
        date: '',
        time: '',
        duration: '',
        reason: '',
        color: '#ff0000'
      },

      newAppointmentIsOpen: false,
      newItemDetails: {
        expert: '',
        time: '',
        sendEmail: true
      },

      editingAppointment: null,
      copyingAppointment: null,
      showAllExperts: false,
      activeAppointment: null,

      activeBlockTime: null,
      editingBlockTime: null
    }
  },
  watch: {

    startDate: function() {
      this.getCalendar()
    },

    endDate: function() {
      this.getCalendar()
    },

    currentDate: function() {
      this.calculateDates()
    },

    dayCount: function() {
      this.calculateDates()
    },
    'newItemDetails.expert': function() {
      if (!this.copyingAppointment) {
        this.newItemDetails.procedure = 0
      }
    },
    'newItemDetails.procedure': function() {
      let procedure = this.procedures.find(p => p.id === this.newItemDetails.procedure)
      if (procedure) {
        this.newItemDetails.length = procedure.length
      } else {
        this.newItemDetails.length = 0
      }
    },
    selectedSchedules: {
      handler: function() {
        localStorage.setItem('selectedSchedules', JSON.stringify(this.selectedSchedules))
      },
      deep: true
    },

    '$route'() {
      this.checkUrlForAppointmentId()
    },

    activeAppointment() {
      if (this.activeAppointment) {
        this.$router.push({ query: { open: 'appointment', appointment: this.activeAppointment.id } })
      } else {
        this.$router.push({ query: {} })
      }
    },
    visible() {
      setTimeout(() => {
        this.onResize()
      }, 1000)
    },
    unfoldable() {
      setTimeout(() => {
        this.onResize()
      }, 1000)
    }
  },

  computed: {
    theme() {
      return useThemeStore().theme
    },
    options() {
      const company = useAuthStore().company;
      return {
        dayStep: this.dayStep,
        showHourGrid: true,
        hourGridMinutes: company['slotSize'],
        dayStartHour: this.staringHour,
        dayEndHour: this.endingHour
      }
    },
    staringHour() {
      let startHour = '23:59'
      if (this.schedules.length > 0) {
        this.schedules.forEach(schedule => {

          if (schedule.schedules) {
            Object.keys(schedule.schedules).forEach(k => {

              let s = schedule.schedules[k]

              if (s.start === s.end) return

              if (s.start.split(':').join('') < startHour.split(':').join('')) {
                startHour = s.start
              }
            })
          }
        })
      }
      //remove 1 hour from the start hour
      let [hour, minute] = startHour.split(':')
      if (minute === '00') {
        hour = parseInt(hour) - 1
        if (hour < 0) hour = 0
      }
      return hour + ':' + minute
    },

    visibleSchedules() {
      if (this.selectedSchedules.length === 0) return []
      let selectionFilter = this.schedules.filter(s => this.selectedSchedules.includes(s.expert.id))

      if (this.copyingAppointment && !this.showAllExperts) {
        return selectionFilter.filter(s => s.expert.id === this.copyingAppointment.expert.id)
      }
      return selectionFilter

    },

    visibleEvents() {
      if (this.selectedSchedules.length === 0) return this.eventList
      return this.eventList.filter(event => {
        return this.selectedSchedules.includes(event.expert.id)
      })
    },

    visibleBlocks() {
      if (this.selectedSchedules.length === 0) return this.blockTimeList
      return this.blockTimeList.filter(event => {
        return this.selectedSchedules.includes(event.expert.id)
      })
    },

    endingHour() {

      let endHour = '00:00'
      if (this.schedules.length > 0) {
        this.schedules.forEach(schedule => {
          if (schedule.schedules) {
            Object.keys(schedule.schedules).forEach(k => {
              let s = schedule.schedules[k]
              if (s.start === s.end) return
              if (s.end.split(':').join('') > endHour.split(':').join('')) {
                endHour = s.end
              }
            })
          }
        })
      }
      //add 1 hour to the end hour
      let [hour, minute] = endHour.split(':')
      if (minute === '00') {
        hour = parseInt(hour) + 1
        if (hour > 23) hour = 23
      }
      return hour + ':' + minute

    },

    ...mapState(useAuthStore, ['token']),

    ...mapState(useSidebarStore, ['visible', 'unfoldable']),

    readyToBuildLayout() {
      return this.startDate && this.endDate && this.currentDate
    },

    calendarTitle() {

      if (!this.startDate || !this.endDate) return ''

      if (this.startDate.isSame(this.endDate, 'day')) {
        return this.startDate.format('DD MMMM YYYY')
      }
      // if same year
      if (this.startDate.format('YYYY') === this.endDate.format('YYYY')) {
        //if same month
        if (this.startDate.format('MM') === this.endDate.format('MM')) {
          return this.startDate.format('DD') + ' - ' + this.endDate.format('DD MMMM YYYY')
        }
        return this.startDate.format('DD MMMM') + ' - ' + this.endDate.format('DD MMMM YYYY')
      }
      return this.startDate.format('DD MMMM YYYY') + ' - ' + this.endDate.format('DD MMMM YYYY')
    },

    VIEW_VERTICAL() {
      return VIEW_VERTICAL
    },
    VIEW_MONTH() {
      return VIEW_MONTH
    },


    expertList() {
      return this.schedules.map(s => {
        return { id: s.expert.id, name: s.expert.name, branch: s.expert.branch, color: s.expert.color }
      })
    },

    expertMap() {

      let uniqueBranches = this.expertList.map(e => e.branch).filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)

      let map = []
      uniqueBranches.forEach(b => {
        map.push(
          {
            branch: b,
            experts: this.expertList.filter(e => e.branch.id === b.id)
          }
        )
      })

      return map

    },

    branchSelected() {

      let map = {}
      this.expertMap.forEach(b => {
        let branch = b.branch
        let experts = b.experts
        let selectedCount = this.selectedSchedules.filter(s => experts.map(ex => ex.id).indexOf(s) > -1).length
        if (selectedCount === experts.length) {
          map[branch.id] = true
        } else if (selectedCount === 0) {
          map[branch.id] = false
        } else {
          map[branch.id] = null
        }

      })
      return map
    },
    selectedExpertProcedureList() {

      let expert = this.schedules.find(s => s.expert.id === this.newItemDetails.expert)

      if (expert) {

        return this.procedures.filter(p => expert.procedures.includes(p.id)).map(p => {
          return { id: p.id, name: p.name, length: p.length }
        })
      }


      return []

    },

    selectedExpertProcedureListUpdate() {

      let expert = this.schedules.find(s => s.expert.id === this.editingAppointment.expert.id)

      if (expert) {

        return this.procedures.filter(p => expert.procedures.includes(p.id)).map(p => {
          return { id: p.id, name: p.name, length: p.length }
        })
      }


      return []

    }


  },
  methods: {

    showQuickActionModal(details) {
      if (this.copyingAppointment) {
        this.openNewAppointmentModal(details)
      } else {
        this.quickActionDetails = {
          time: details.time,
          expert: details.expert
        }
        this.quickActionModalOpen = true
      }
    },

    // Select Add Appointment from Quick Action Modal
    selectAddAppointment() {
      this.quickActionModalOpen = false
      this.openNewAppointmentModal(this.quickActionDetails)
    },

    // Select Block Time from Quick Action Modal
    selectBlockTime() {
      this.quickActionModalOpen = false
      this.openBlockTimeModal()
    },

    // Open Block Time Modal
    openBlockTimeModal() {
      this.blockTimeModalOpen = true
      this.blockTimeDetails = {
        expert: this.quickActionDetails.expert ? this.quickActionDetails.expert.id : '',
        date: this.quickActionDetails.time ? this.quickActionDetails.time.format('YYYY-MM-DD') : '',
        time: this.quickActionDetails.time ? this.quickActionDetails.time.format('HH:mm') : '',
        duration: '',
        reason: ''
      }
    },

    // Save Block Time
    crateBlockTime() {


      createBlockTime(this.token,
        this.blockTimeDetails.expert,
        this.blockTimeDetails.date + ' ' + this.blockTimeDetails.time,
        this.blockTimeDetails.duration,
        this.blockTimeDetails.reason,
        this.newItemDetails.color
      ).then(response => {
        if (response.code === 200) {
          toast.success('Time blocked successfully');
          this.blockTimeModalOpen = false
          this.copyingAppointment = null
          this.getCalendar()
        } else {
          toast.error(response.message)
        }
      })


    },

    checkUrlForAppointmentId() {
      if (this.$route.query['open'] === 'appointment') {
        let appointment = this.$route.query['appointment']

        getAppointment(this.token, appointment).then(response => {
          if (response.code === 200) {
            this.activeAppointment = response.appointment
          } else {
            toast.error(response.message);
          }
        })

      }
    },

    getCalendar() {
      if (this.startDate && this.endDate) {
        getCalendarInfo(this.token, this.startDate.format('YYYY-MM-DD'), this.endDate.endOf('day').format('YYYY-MM-DD HH:mm:ss')).then((response) => {
          if (response.code === 200) {
            this.eventList = response.appointments
            this.blockTimeList = response.blockTimes;
          } else {
            toast.error(response.message);
          }
        })
      }
    },

    getSchedules() {
      getSchedules(this.token).then((response) => {
        if (response.code === 200) {
          this.schedules = response.data

          let selectedSchedules = localStorage.getItem('selectedSchedules')

          if (selectedSchedules) {
            this.selectedSchedules = JSON.parse(selectedSchedules)
          } else {
            this.selectedSchedules = this.schedules.map(s => s.expert.id)
          }
        } else {
          toast.error(response.message);
        }
      })
    },

    getProcedures() {
      getProcedures(this.token).then(response => {
        this.procedures = response
      })
    },

    calculateDates() {
      this.startDate = this.currentDate
      this.endDate = this.startDate.add(this.dayCount - 1, 'day')
    },

    branchClicked(branchId, event) {

      console.log(branchId)

      let expertList = this.expertList.filter(e => e.branch.id === branchId)
      let selected = expertList.map(e => e.id)

      if (event.target.checked) {
        this.selectedSchedules = this.selectedSchedules.concat(selected)
      } else {
        this.selectedSchedules = this.selectedSchedules.filter(s => !selected.includes(s))
      }

    },

    prevView() {
      if (this.currentDate && (!this.minDate || this.currentDate.isAfter(this.minDate))) {
        if (this.activeView === 'month') {
          this.currentDate = this.currentDate.subtract(1, 'month')
          this.dayCount = this.currentDate.daysInMonth()
        } else {
          this.currentDate = this.currentDate.subtract(this.options.dayStep, 'day')
        }
      }
      return false
    },
    nextView() {
      if (this.currentDate && (!this.maxDate || this.currentDate.isBefore(this.maxDate))) {
        if (this.activeView === 'month') {
          this.currentDate = this.currentDate.add(1, 'month')
          this.dayCount = this.currentDate.daysInMonth()
        } else {
          this.currentDate = this.currentDate.add(this.options.dayStep, 'day')
        }
      }
      return false
    },

    goToToday() {
      this.currentDate = this.$dayjs()
      this.activateView(this.activeView)
    },
    onResize() {
      this.screenWidth = window.document.getElementById('calendarView').offsetWidth - 10
      this.screenHeight = window.innerHeight * 2

      if (this.screenWidth < 500) {
        this.activateView('day')
      } else if (this.screenWidth < 768) {
        this.activateView('day3')
      } else {
        this.activateView(this.activeView)
      }
    },

    activateView(view) {
      let config = this.views[view]
      if (!config) {
        console.error('Invalid view', view)
        return
      }
      this.activeView = view
      this.dayCount = config.dayCount
      this.dayStep = config.dayStep
      this.view = config.type

      if (!this.currentDate) {
        this.currentDate = this.$dayjs()
      }

      if (config.type === VIEW_MONTH) {
        this.currentDate = this.currentDate.startOf('month')
        this.dayStep = this.currentDate.daysInMonth()
        this.dayCount = this.dayStep
      } else if (view === 'week') {
        this.currentDate = this.currentDate.startOf('week')
      } else {
        this.currentDate = this.currentDate.startOf('day')
      }

    },

    calendarDayClick(day) {
      this.currentDate = this.$dayjs(day.id).startOf(this.activeView)
    },

    openDayDailyView(day) {
      this.currentDate = day.startOf('day')
      this.activateView('day')
    },

    openNewAppointmentModal(details) {
      this.newAppointmentIsOpen = true

      if (this.copyingAppointment) {

        this.newItemDetails = {
          expert: details.expert.id,
          date: details.time.format('YYYY-MM-DD'),
          time: details.time.format('HH:mm:00'),
          procedure: this.copyingAppointment.procedure.id,
          length: this.copyingAppointment.reservationLength,
          name: this.copyingAppointment.name,
          surname: this.copyingAppointment.surname,
          phone: this.copyingAppointment.phone,
          email: this.copyingAppointment.email,
          notes: '',
          color: this.copyingAppointment.color
        }
      } else {

        this.newItemDetails = {
          expert: details.expert.id,
          date: details.time.format('YYYY-MM-DD'),
          time: details.time.format('HH:mm:00'),
          procedure: 0,
          length: 0,
          name: '',
          surname: '',
          phone: '',
          email: '',
          notes: '',
          color: '#387f94'
        }
      }
    },
    startNewEventFromScratch() {
      this.newAppointmentIsOpen = true
      this.newItemDetails = {
        expert: null,
        date: null,
        time: null,
        procedure: 0,
        length: 0,
        name: '',
        surname: '',
        phone: '',
        email: '',
        notes: '',
        color: '#387f94'
      }
    },

    editAppointment(appointment) {
      this.editingAppointment = JSON.parse(JSON.stringify(appointment))
      this.editingAppointment.date = this.$dayjs(appointment.reservationStartTime.date).format('YYYY-MM-DD')
      this.editingAppointment.time = this.$dayjs(appointment.reservationStartTime.date).format('HH:mm')
    },

    editBlockTime(appointment) {
      this.editingBlockTime = JSON.parse(JSON.stringify(appointment))
      this.editingBlockTime.date = this.$dayjs(appointment.startTime.date).format('YYYY-MM-DD')
      this.editingBlockTime.time = this.$dayjs(appointment.startTime.date).format('HH:mm')
    },

    confirmAppointment(appointment) {

      this.$swal({
        title: 'Confirm appointment',
        text: 'Are you sure you want to confirm the appointment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) return
        confirm(this.token, appointment.id).then(response => {
            if (response.code === 200) {
              toast.success('Appointment confirmed');
              this.getCalendar()
              //todo update from api
              this.activeAppointment.status = 'confirmed'
            } else {
              toast.error(response.message);
            }
          }
        )
      })


    },
    cancelAppointment(appointment) {

      this.$swal({
        title: 'Cancel appointment',
        text: 'Are you sure you want to cancel the appointment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) return
        cancel(this.token, appointment.id).then(response => {
            if (response.code === 200) {
              toast.success('Appointment cancelled');
              this.getCalendar()
              //todo update from api
              this.activeAppointment.status = 'cancelled_expert'
            } else {
              toast.error(response.message);
            }
          }
        )
      })


    },
    deleteBlockTime(blockTime) {

      this.$swal({
        title: 'Delete block time',
        text: 'Are you sure you want to delete block time?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) return
        deleteTime(this.token, blockTime.id).then(response => {
            if (response.code === 200) {
              toast.success('Deleted!');
              this.getCalendar()
              this.activeBlockTime = null;
            } else {
              toast.error(response.message);
            }
          }
        )
      })


    },

    copyAppointment(appointment) {
      this.activeAppointment = null
      this.copyingAppointment = JSON.parse(JSON.stringify(appointment))
    },

    printAppointment(appointment) {

      let html = '<!doctype>' +
        '<html lang="en">' +
        '<head>' +
        '<title>Print</title>' +
        '</head>' +
        '<body>' +
        '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px;">' +
        '<h3>Appointment details</h3>' +
        '<p><strong>Expert:</strong> ' + appointment.expert.fullName + '</p>' +
        '<p><strong>Procedure:</strong> ' + appointment.procedure.name + '</p>' +
        '<p><strong>Starts:</strong> ' + this.formatTime(appointment.reservationStartTime.date) + '</p>' +
        '<p><strong>Duration:</strong> ' + appointment.reservationLength + ' minute</p>' +
        '<p><strong>Customer:</strong> ' + appointment.name + ' ' + appointment.surname + '</p>' +
        '<p><strong>Phone:</strong> ' + appointment.phone + '</p>' +
        '<p><strong>Email:</strong> ' + appointment.email + '</p>' +
        '</div>' +
        '</body>' +
        '</html>'

      let w = window.open()
      w.document.write(html)
      w.print()
      w.close()

    },

    createNewAppointment() {

      createAppointment(this.token,
        this.newItemDetails.expert,
        this.newItemDetails.procedure,
        this.newItemDetails.date + ' ' + this.newItemDetails.time,
        this.newItemDetails.length,
        this.newItemDetails.name,
        this.newItemDetails.surname,
        this.newItemDetails.phone,
        this.newItemDetails.email,
        this.newItemDetails.notes,
        this.newItemDetails.color,
        this.newItemDetails.sendEmail ? 1 : 0
      ).then(response => {
        if (response.code === 200) {
          toast.success('Appointment created');
          this.newAppointmentIsOpen = false
          this.copyingAppointment = null
          this.getCalendar()
        } else {
          toast.error(response.message);
        }
      })

    },

    updateAppointment() {

      updateAppointment(this.token,
        this.editingAppointment.id,
        this.editingAppointment.expert.id,
        this.editingAppointment.procedure.id,
        this.editingAppointment.date + ' ' + this.editingAppointment.time,
        this.editingAppointment.reservationLength,
        this.editingAppointment.name,
        this.editingAppointment.surname,
        this.editingAppointment.phone,
        this.editingAppointment.email,
        this.editingAppointment.notes,
        this.editingAppointment.color
      ).then(response => {
        if (response.code === 200) {
          toast.success('Appointment updated');
          this.editingAppointment = null
          //todo get active appointment one more time to update the view
          this.getCalendar()
        } else {
          toast.error(response.message);
        }
      })

    },

    updateBlockTime() {

      updateBlockTime(this.token,
        this.editingBlockTime.id,
        this.editingBlockTime.expert.id,
        this.editingBlockTime.date + ' ' + this.editingBlockTime.time,
        this.editingBlockTime.duration,
        this.editingBlockTime.comment,
        this.editingBlockTime.color
      ).then(response => {
        if (response.code === 200) {
          toast.success('Block time updated');
          this.editingBlockTime = null
          //todo get active appointment one more time to update the view
          this.getCalendar()
        } else {
          toast.error(response.message);
        }
      })

    },

    updateAppointmentTime(event) {

      if(event.event.type === "block"){
        //this is block time

        this.$swal({
          title: 'Update block time',
          text: 'Are you sure you want to update the block?',
          html: '<p><strong>Expert: </strong>' + event.expert.name + '</p><p><strong>Time: </strong> ' + event.time.format('DD MMM YYYY HH:mm') + '</p>',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (!result.isConfirmed) return
          setBlockTime(this.token, event.event.id, event.time.format('YYYY-MM-DD HH:mm:ss'), event.expert.id).then(response => {
              if (response.code === 200) {
                toast.success('Block time updated.')
                this.getCalendar()
              } else {
                toast.error(response.message);
              }
            }
          )
        })

      } else {


        this.$swal({
          title: 'Update appointment time',
          text: 'Are you sure you want to update the appointment?',
          html: '<p><strong>Expert: </strong>' + event.expert.name + '</p><p><strong>Time: </strong> ' + event.time.format('DD MMM YYYY HH:mm') + '</p>',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No'
        }).then((result) => {
          if (!result.isConfirmed) return
          setTime(this.token, event.event.id, event.time.format('YYYY-MM-DD HH:mm:ss'), event.expert.id).then(response => {
              if (response.code === 200) {
                toast.success('Appointment time updated');
                this.getCalendar()
              } else {
                toast.error(response.message);
              }
            }
          )
        })
      }

    },

    updateAppointmentLength(event) {


      this.$swal({
        title: 'Update appointment length',
        text: 'Are you sure you want to update the appointment?',
        html: '<p>Lenght:' + event.newLength + ' minutes</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) {
          this.getCalendar()
          return
        }
        setLength(this.token, event.event.id, event.newLength).then(response => {
            if (response.code === 200) {
              toast.success('Appointment updated');
              this.getCalendar()
            } else {
              toast.error(response.message);
            }
          }
        )
      })


    },

    updateBlockTimeLength(event) {


      this.$swal({
        title: 'Update block time length',
        text: 'Are you sure you want to update the block?',
        html: '<p>Lenght:' + event.newLength + ' minutes</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (!result.isConfirmed) {
          this.getCalendar()
          return
        }
        setBlockLength(this.token, event.block.id, event.newLength).then(response => {
            if (response.code === 200) {
              toast.success('Block updated');
              this.getCalendar()
            } else {
              toast.error(response.message);
            }
          }
        )
      })


    },

    showAppointmentDetails(event) {

      this.activeAppointment = event

    },

    showBlockTimeDetails(blockTime) {

      this.activeBlockTime = blockTime

    },
    formatTime(time) {
      return this.$dayjs(time).format('DD.MM.YYYY HH:mm')
    }
  },
  mounted() {

    this.onResize()


    setTimeout(() => {
      this.onResize()
    }, 1000)

    window.addEventListener('resize', this.onResize)

    this.currentDate = this.$dayjs().startOf(this.activeView)
    this.calculateDates()

    this.getSchedules()

    this.getProcedures()

    this.checkUrlForAppointmentId()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
}

</script>

<style scoped>
</style>
