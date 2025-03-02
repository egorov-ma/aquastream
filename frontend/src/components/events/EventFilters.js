import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  InputAdornment,
  FormControl,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Collapse,
  Chip,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { Typography, TextField, Button } from '../ui';
import { useTheme } from '@mui/material/styles';

const EventFilters = ({ onFilterChange, activeFilters, regions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [dateRange, setDateRange] = useState({
    from: activeFilters.dateFrom || '',
    to: activeFilters.dateTo || ''
  });
  const [selectedRegions, setSelectedRegions] = useState(activeFilters.regions || []);
  const [hasAvailableSpots, setHasAvailableSpots] = useState(activeFilters.hasAvailableSpots || false);

  // Функция обработки изменения поискового запроса
  const handleSearchChange = (e) => {
    onFilterChange({ ...activeFilters, query: e.target.value });
  };

  // Функция обработки изменения даты
  const handleDateChange = (field, value) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    onFilterChange({ 
      ...activeFilters, 
      dateFrom: newDateRange.from, 
      dateTo: newDateRange.to 
    });
  };

  // Функция обработки выбора региона
  const handleRegionChange = (region) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    
    setSelectedRegions(newRegions);
    onFilterChange({ ...activeFilters, regions: newRegions });
  };

  // Функция обработки чекбокса наличия свободных мест
  const handleAvailableSpotsChange = (e) => {
    setHasAvailableSpots(e.target.checked);
    onFilterChange({ ...activeFilters, hasAvailableSpots: e.target.checked });
  };

  // Функция сброса всех фильтров
  const handleResetFilters = () => {
    setDateRange({ from: '', to: '' });
    setSelectedRegions([]);
    setHasAvailableSpots(false);
    onFilterChange({ query: activeFilters.query });
  };

  // Подсчет активных фильтров для бейджа
  const countActiveFilters = () => {
    let count = 0;
    if (dateRange.from) count++;
    if (dateRange.to) count++;
    count += selectedRegions.length;
    if (hasAvailableSpots) count++;
    return count;
  };

  const activeFiltersCount = countActiveFilters();

  return (
    <Box sx={{ mb: 4 }}>
      {/* Поисковая строка */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по названию, описанию или ключевым словам"
          variant="outlined"
          value={activeFilters.query || ''}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: isMobile && (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowFilters(!showFilters)}
                  color={activeFiltersCount > 0 ? "primary" : "default"}
                >
                  <Badge badgeContent={activeFiltersCount} color="primary">
                    <TuneIcon />
                  </Badge>
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Кнопка показа фильтров для мобильных */}
      {!isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="text"
            color="primary"
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button 
              onClick={handleResetFilters}
              variant="text" 
              color="primary"
              startIcon={<CloseIcon />}
            >
              Сбросить фильтры
            </Button>
          )}
        </Box>
      )}

      {/* Блок фильтров */}
      <Collapse in={showFilters}>
        <Box sx={{ 
          p: 3, 
          borderRadius: 2, 
          bgcolor: 'background.paper', 
          boxShadow: 1,
          mb: 3 
        }}>
          <Grid container spacing={3}>
            {/* Фильтр по дате */}
            <Grid item xs={12} md={6} lg={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                  Дата проведения
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="От"
                      type="date"
                      variant="outlined"
                      value={dateRange.from}
                      onChange={(e) => handleDateChange('from', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="До"
                      type="date"
                      variant="outlined"
                      value={dateRange.to}
                      onChange={(e) => handleDateChange('to', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Фильтр по региону */}
            <Grid item xs={12} md={6} lg={6}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  Регион
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {regions.map((region) => (
                    <Chip
                      key={region}
                      label={region}
                      onClick={() => handleRegionChange(region)}
                      color={selectedRegions.includes(region) ? "primary" : "default"}
                      variant={selectedRegions.includes(region) ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Фильтр по наличию мест */}
            <Grid item xs={12} md={6} lg={3}>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                  Доступность
                </Typography>
                <FormControl component="fieldset">
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={hasAvailableSpots}
                        onChange={handleAvailableSpotsChange}
                        color="primary"
                      />
                    }
                    label="Только со свободными местами"
                  />
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          {/* Кнопки для мобильных */}
          {isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                onClick={handleResetFilters}
                variant="outlined" 
                color="primary"
              >
                Сбросить
              </Button>
              <Button 
                onClick={() => setShowFilters(false)}
                variant="contained" 
                color="primary"
              >
                Применить
              </Button>
            </Box>
          )}
        </Box>
      </Collapse>

      {/* Отображение активных фильтров */}
      {activeFiltersCount > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            Активные фильтры:
          </Typography>
          
          {dateRange.from && (
            <Chip 
              label={`От: ${dateRange.from}`}
              onDelete={() => handleDateChange('from', '')}
              size="small"
            />
          )}
          
          {dateRange.to && (
            <Chip 
              label={`До: ${dateRange.to}`}
              onDelete={() => handleDateChange('to', '')}
              size="small"
            />
          )}
          
          {selectedRegions.map(region => (
            <Chip 
              key={region}
              label={region}
              onDelete={() => handleRegionChange(region)}
              size="small"
            />
          ))}
          
          {hasAvailableSpots && (
            <Chip 
              label="Только со свободными местами"
              onDelete={() => {
                setHasAvailableSpots(false);
                onFilterChange({ ...activeFilters, hasAvailableSpots: false });
              }}
              size="small"
            />
          )}
        </Box>
      )}
    </Box>
  );
};

// Компонент Badge для отображения количества активных фильтров
const Badge = ({ badgeContent, color, children }) => {
  if (badgeContent === 0) {
    return children;
  }
  
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <Box
        sx={{
          position: 'absolute',
          top: -8,
          right: -8,
          bgcolor: color === 'primary' ? 'primary.main' : 'grey.500',
          color: 'white',
          borderRadius: '50%',
          width: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        {badgeContent}
      </Box>
    </Box>
  );
};

export default EventFilters; 